import express from 'express';
import pool from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const STATUSES = ['yet_to_start', 'working', 'completed'];

// GET /api/work-orders — Map Dashboard base layer (used by both
// Super Dept and Dept Admin screens). Optional ?department= filter;
// dept-scoped roles are always restricted to their own department.
router.get('/work-orders', requireRole('super_admin', 'super_dept', 'dept_admin'), async (req, res) => {
  const department = req.user.role === 'super_admin' ? req.query.department : req.user.department;

  const { rows } = await pool.query(
    `SELECT id, department, status, title,
            ST_AsGeoJSON(route)::json AS route_geojson,
            created_at
     FROM work_orders
     WHERE ($1::text IS NULL OR department = $1)
     ORDER BY created_at DESC`,
    [department || null]
  );

  // GeoJSON FeatureCollection — colored per department, dashed/solid per
  // status is a frontend styling concern driven off these two fields.
  res.json({
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      geometry: r.route_geojson,
      properties: {
        id: r.id,
        department: r.department,
        status: r.status,
        title: r.title,
        created_at: r.created_at,
      },
    })),
  });
});

// PATCH /api/work-orders/:id/status — dept accounts update their own
// route's progress (yet_to_start / working / completed)
router.patch(
  '/work-orders/:id/status',
  requireRole('super_dept', 'dept_admin'),
  async (req, res) => {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${STATUSES.join(', ')}` });
    }

    const { rows } = await pool.query(
      `UPDATE work_orders
       SET status = $1
       WHERE id = $2 AND department = $3
       RETURNING id, department, status`,
      [status, req.params.id, req.user.department]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found in your department' });
    }
    res.json(rows[0]);
  }
);

// GET /api/conflicts — read-only conflict-zone overlay from the core
// Spatial-Temporal Conflict Engine, layered on top of the same map
router.get('/conflicts', requireRole('super_admin', 'super_dept', 'dept_admin'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, work_order_a_id, work_order_b_id, severity,
            ST_AsGeoJSON(zone)::json AS zone_geojson, created_at
     FROM conflicts
     ORDER BY created_at DESC`
  );
  res.json({
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      geometry: r.zone_geojson,
      properties: { id: r.id, severity: r.severity, created_at: r.created_at },
    })),
  });
});

export default router;
