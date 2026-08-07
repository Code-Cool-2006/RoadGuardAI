const express = require('express');
const router = express.Router();
const pool = require('../db');
const { detectConflicts } = require('../services/conflictEngine');

router.post('/', async (req, res) => {
  const { department, title, route, start_date, end_date, buffer_m = 15 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO work_orders (department, title, route, start_date, end_date, buffer_m)
       VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5, $6) RETURNING id`,
      [department, title, JSON.stringify(route), start_date, end_date, buffer_m]
    );
    const conflicts = await detectConflicts(result.rows[0].id, route, buffer_m);
    res.status(201).json({ id: result.rows[0].id, conflicts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT id, department, title, ST_AsGeoJSON(route) as route, start_date, end_date, status
     FROM work_orders ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body; // 'yet_to_start' | 'working' | 'completed'
  await pool.query('UPDATE work_orders SET status = $1 WHERE id = $2', [status, req.params.id]);
  res.json({ updated: true });
});

module.exports = router;