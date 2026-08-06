const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

// Super Admin creates super_dept accounts; Super Dept creates dept_admin accounts
router.post('/', requireRole('super_admin', 'super_dept'), async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (req.user.role === 'super_dept' && role !== 'dept_admin') {
    return res.status(403).json({ error: 'Super Dept accounts can only create dept_admin accounts' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, department`,
      [name, email, password_hash, role, department, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireRole('super_admin', 'super_dept'), async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, department FROM users ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

module.exports = router;