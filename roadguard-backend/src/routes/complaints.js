const express = require('express');
const router = express.Router();
const pool = require('../db');
const { analyzePhoto } = require('../services/aiAnalyzer');
const { processAndSavePhoto } = require('../services/imageUploader');

router.post('/', async (req, res) => {
  const { citizen_name, citizen_contact, department, photo_url, description, location } = req.body;
  try {
    const finalPhotoUrl = await processAndSavePhoto(photo_url, req.get('host'), req.protocol);

    const result = await pool.query(
      `INSERT INTO complaints (citizen_name, citizen_contact, department, photo_url, description, location)
       VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6)) RETURNING id`,
      [citizen_name, citizen_contact, department, finalPhotoUrl, description, JSON.stringify(location)]
    );

    const verdict = await analyzePhoto(finalPhotoUrl);
    await pool.query(
      `UPDATE complaints
       SET ai_is_genuine=$1, ai_issue_type=$2, ai_suggested_dept=$3, ai_confidence=$4
       WHERE id=$5`,
      [verdict.is_likely_genuine, verdict.issue_type, verdict.suggested_department, verdict.confidence, result.rows[0].id]
    );

    res.status(201).json({ id: result.rows[0].id, verdict, photo_url: finalPhotoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const { department, status } = req.query;
  const result = await pool.query(
    `SELECT * FROM complaints
     WHERE ($1::text IS NULL OR department = $1)
       AND ($2::text IS NULL OR status = $2)
     ORDER BY submitted_at DESC`,
    [department || null, status || null]
  );
  res.json(result.rows);
});

router.patch('/:id', async (req, res) => {
  const { status } = req.body; // 'accepted' | 'denied'
  await pool.query('UPDATE complaints SET status = $1, updated_at = now() WHERE id = $2', [status, req.params.id]);
  res.json({ updated: true });
});

router.patch('/:id/assign', async (req, res) => {
  const { assigned_to } = req.body;
  await pool.query('UPDATE complaints SET assigned_to = $1 WHERE id = $2', [assigned_to, req.params.id]);
  res.json({ assigned: true });
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body; // 'in_progress' | 'resolved'
  await pool.query('UPDATE complaints SET status = $1, updated_at = now() WHERE id = $2', [status, req.params.id]);
  res.json({ updated: true });
});

module.exports = router;