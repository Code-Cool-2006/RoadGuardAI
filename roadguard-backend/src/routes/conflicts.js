const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT c.id, c.work_order_a, c.work_order_b, c.day_gap, c.severity,
           ST_AsGeoJSON(c.overlap_geom) as overlap_geom,
           wa.department as dept_a, wb.department as dept_b
    FROM conflicts c
    JOIN work_orders wa ON c.work_order_a = wa.id
    JOIN work_orders wb ON c.work_order_b = wb.id
    ORDER BY c.created_at DESC
  `);
  res.json(result.rows);
});

router.get('/:id/recommendation', async (req, res) => {
  const result = await pool.query(`
    SELECT wa.start_date as a_start, wa.end_date as a_end, wa.department as dept_a,
           wb.start_date as b_start, wb.end_date as b_end, wb.department as dept_b
    FROM conflicts c
    JOIN work_orders wa ON c.work_order_a = wa.id
    JOIN work_orders wb ON c.work_order_b = wb.id
    WHERE c.id = $1
  `, [req.params.id]);

  if (result.rows.length === 0) return res.status(404).json({ error: 'Conflict not found' });

  const row = result.rows[0];
  const allDates = [row.a_start, row.a_end, row.b_start, row.b_end].map(d => new Date(d));
  const unifiedStart = new Date(Math.min(...allDates));
  const unifiedEnd = new Date(Math.max(...allDates));

  res.json({
    departments_involved: [row.dept_a, row.dept_b],
    recommended_window: {
      start: unifiedStart.toISOString().split('T')[0],
      end: unifiedEnd.toISOString().split('T')[0],
    },
    note: 'V1 heuristic — combined earliest-to-latest window, not an optimized schedule.',
  });
});

module.exports = router;