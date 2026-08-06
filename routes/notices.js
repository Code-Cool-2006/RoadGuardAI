import express from 'express';
import pool from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// POST /api/notices — Super Dept "Publish Notice" screen
router.post('/', requireRole('super_dept'), async (req, res) => {
  const { title, content, work_order_id } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const { rows } = await pool.query(
    `INSERT INTO notices (department, published_by, title, content, work_order_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.user.department, req.user.id, title, content, work_order_id || null]
  );
  res.status(201).json(rows[0]);
});

// GET /api/notices — Super Admin "Notices View" (all), or a dept's own
// super_dept/dept_admin accounts (their department only)
router.get('/', requireRole('super_admin', 'super_dept', 'dept_admin'), async (req, res) => {
  let query = `
    SELECT n.*, u.name AS published_by_name
    FROM notices n
    JOIN users u ON u.id = n.published_by
  `;
  const params = [];

  if (req.user.role !== 'super_admin') {
    query += ' WHERE n.department = $1';
    params.push(req.user.department);
  }
  query += ' ORDER BY n.created_at DESC';

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

export default router;
