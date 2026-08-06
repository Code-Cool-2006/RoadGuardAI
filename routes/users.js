import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const DEPARTMENTS = ['roads', 'water', 'telecom', 'gas'];

// POST /api/users
// - super_admin can create 'super_dept' or 'dept_admin' accounts for any department
// - super_dept can only create 'dept_admin' accounts, and only for their own department
router.post('/', requireRole('super_admin', 'super_dept'), async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role || !department) {
    return res.status(400).json({ error: 'name, email, password, role, department are required' });
  }
  if (!DEPARTMENTS.includes(department)) {
    return res.status(400).json({ error: `department must be one of ${DEPARTMENTS.join(', ')}` });
  }

  if (req.user.role === 'super_dept') {
    if (role !== 'dept_admin') {
      return res.status(403).json({ error: 'super_dept accounts may only create dept_admin accounts' });
    }
    if (department !== req.user.department) {
      return res.status(403).json({ error: 'Cannot create accounts outside your own department' });
    }
  } else if (!['super_dept', 'dept_admin'].includes(role)) {
    return res.status(400).json({ error: "role must be 'super_dept' or 'dept_admin'" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, department, created_at`,
      [name, email, passwordHash, role, department, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint === 'one_super_dept_per_department' ? 'department' : 'email';
      return res.status(409).json({
        error: field === 'department'
          ? 'This department already has a super_dept account'
          : 'A user with this email already exists',
      });
    }
    throw err;
  }
});

// GET /api/users/staff?department=roads — dept admins picking who to assign a complaint to
router.get('/staff', requireRole('super_dept', 'dept_admin'), async (req, res) => {
  const department = req.user.department;
  const { rows } = await pool.query(
    `SELECT id, name, email FROM users WHERE department = $1 AND role = 'dept_admin' ORDER BY name`,
    [department]
  );
  res.json(rows);
});

export default router;
