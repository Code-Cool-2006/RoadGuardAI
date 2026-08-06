import express from 'express';
import pool from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const STATUSES = ['pending', 'accepted', 'denied', 'in_progress', 'resolved'];

// GET /api/community/complaints — Community Feed
// Visible to all logged-in web users. super_admin sees everything;
// super_dept / dept_admin are scoped to their own department's queue.
// Optional ?status= filter on top of that.
router.get(
  '/community/complaints',
  requireRole('super_admin', 'super_dept', 'dept_admin'),
  async (req, res) => {
    const { status } = req.query;
    const department = req.user.role === 'super_admin' ? req.query.department || null : req.user.department;

    const { rows } = await pool.query(
      `SELECT c.*, ST_AsGeoJSON(c.location)::json AS location_geojson,
              u.name AS assigned_to_name
       FROM complaints c
       LEFT JOIN users u ON u.id = c.assigned_to
       WHERE ($1::text IS NULL OR c.department = $1)
         AND ($2::text IS NULL OR c.status = $2)
       ORDER BY c.submitted_at DESC`,
      [department, status || null]
    );
    res.json(rows);
  }
);

// GET /api/community/complaints/:id — Complaint Detail screen
router.get(
  '/community/complaints/:id',
  requireRole('super_admin', 'super_dept', 'dept_admin'),
  async (req, res) => {
    const { rows } = await pool.query(
      `SELECT c.*, ST_AsGeoJSON(c.location)::json AS location_geojson,
              u.name AS assigned_to_name
       FROM complaints c
       LEFT JOIN users u ON u.id = c.assigned_to
       WHERE c.id = $1`,
      [req.params.id]
    );
    const complaint = rows[0];
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (req.user.role !== 'super_admin' && complaint.department !== req.user.department) {
      return res.status(403).json({ error: 'Cannot view a complaint outside your department' });
    }
    res.json(complaint);
  }
);

// PATCH /api/complaints/:id/status — Dept Admin accept/deny, then
// progress through in_progress → resolved
router.patch('/complaints/:id/status', requireRole('dept_admin'), async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}` });
  }

  const current = await pool.query('SELECT department, status FROM complaints WHERE id = $1', [req.params.id]);
  if (current.rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });
  if (current.rows[0].department !== req.user.department) {
    return res.status(403).json({ error: 'Cannot act on a complaint outside your department' });
  }

  const validTransitions = {
    pending: ['accepted', 'denied'],
    accepted: ['in_progress'],
    in_progress: ['resolved'],
    denied: [],
    resolved: [],
  };
  const from = current.rows[0].status;
  if (!validTransitions[from]?.includes(status)) {
    return res.status(409).json({ error: `Cannot move complaint from '${from}' to '${status}'` });
  }

  const { rows } = await pool.query(
    `UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  res.json(rows[0]);
});

// PATCH /api/complaints/:id/assign — Dept Admin assigns a staff member
// (must be a dept_admin/staff account within the same department)
router.patch('/complaints/:id/assign', requireRole('dept_admin'), async (req, res) => {
  const { assigned_to } = req.body;
  if (!assigned_to) return res.status(400).json({ error: 'assigned_to (user id) is required' });

  const complaintRes = await pool.query('SELECT department, status FROM complaints WHERE id = $1', [
    req.params.id,
  ]);
  if (complaintRes.rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });
  if (complaintRes.rows[0].department !== req.user.department) {
    return res.status(403).json({ error: 'Cannot act on a complaint outside your department' });
  }
  if (complaintRes.rows[0].status === 'denied') {
    return res.status(409).json({ error: 'Cannot assign staff to a denied complaint' });
  }

  const staffRes = await pool.query(
    `SELECT id FROM users WHERE id = $1 AND department = $2 AND role = 'dept_admin'`,
    [assigned_to, req.user.department]
  );
  if (staffRes.rows.length === 0) {
    return res.status(400).json({ error: 'assigned_to must be a staff account in your department' });
  }

  const { rows } = await pool.query(
    `UPDATE complaints SET assigned_to = $1 WHERE id = $2 RETURNING *`,
    [assigned_to, req.params.id]
  );
  res.json(rows[0]);
});

export default router;
