const pool = require('../db');

function classifySeverity(dayGap) {
  if (dayGap <= 30) return 'high';
  if (dayGap <= 60) return 'medium';
  return 'low';
}

function dateRangeGapDays(startA, endA, startB, endB) {
  const aStart = new Date(startA);
  const aEnd = new Date(endA);
  const bStart = new Date(startB);
  const bEnd = new Date(endB);

  if (aEnd < bStart) return Math.round((bStart - aEnd) / 86400000);
  if (bEnd < aStart) return Math.round((aStart - bEnd) / 86400000);
  return 0; // date ranges overlap
}

async function detectConflicts(newOrderId, routeGeoJSON, bufferM) {
  const nearby = await pool.query(
    `SELECT id, department, start_date, end_date,
            ST_AsGeoJSON(
              ST_Intersection(
                ST_Buffer(route::geography, buffer_m)::geometry,
                ST_Buffer(ST_GeomFromGeoJSON($1)::geography, $2)::geometry
              )
            ) AS overlap_geom
     FROM work_orders
     WHERE id != $3
       AND ST_DWithin(route::geography, ST_GeomFromGeoJSON($1)::geography, $2 + buffer_m)`,
    [JSON.stringify(routeGeoJSON), bufferM, newOrderId]
  );

  const newOrder = await pool.query(
    'SELECT start_date, end_date FROM work_orders WHERE id = $1',
    [newOrderId]
  );
  const { start_date, end_date } = newOrder.rows[0];

  const conflicts = [];
  for (const row of nearby.rows) {
    const gap = dateRangeGapDays(start_date, end_date, row.start_date, row.end_date);
    if (gap <= 90) {
      const severity = classifySeverity(gap);
      await pool.query(
        `INSERT INTO conflicts (work_order_a, work_order_b, overlap_geom, day_gap, severity)
         VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5)`,
        [newOrderId, row.id, row.overlap_geom, gap, severity]
      );
      conflicts.push({ with_work_order: row.id, department: row.department, day_gap: gap, severity });
    }
  }
  return conflicts;
}

module.exports = { detectConflicts };