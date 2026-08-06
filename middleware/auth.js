import jwt from 'jsonwebtoken';

/**
 * Verifies the bearer JWT and attaches { id, role, department } to req.user.
 * This is the "Role Router" from the auth flow: every downstream route
 * decides what's visible based on req.user.role / req.user.department.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      department: payload.department || null,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Restricts a route to a set of roles, e.g. requireRole('super_dept').
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden for this role' });
    }
    next();
  };
}

/**
 * For dept-scoped roles (super_dept, dept_admin), ensures the department in
 * the request body/query matches the caller's own department, unless the
 * caller is super_admin (who can act across departments).
 * Pass the field name to check (defaults to 'department').
 */
function requireOwnDepartment(field = 'department') {
  return (req, res, next) => {
    if (req.user.role === 'super_admin') return next();

    const targetDept = req.body?.[field] ?? req.query?.[field] ?? req.params?.[field];
    if (targetDept && targetDept !== req.user.department) {
      return res.status(403).json({ error: 'Cannot act outside your own department' });
    }
    next();
  };
}

export { authenticate, requireRole, requireOwnDepartment };
