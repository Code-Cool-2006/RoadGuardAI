const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('super_dept'), async (req, res) => {
  const { title, content, work_order_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO notices (department, published_by, title, content, work_order_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.user.department, req.user.id, title, content, work_order_id || null]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
  res.json(result.rows);
});

module.exports = router;