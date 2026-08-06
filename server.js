import 'dotenv/config';
import 'express-async-errors'; // lets async route handlers throw and hit the error middleware below
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import noticeRoutes from './routes/notices.js';
import mapDashboardRoutes from './routes/mapDashboard.js';
import complaintRoutes from './routes/complaints.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api', mapDashboardRoutes);   // /api/work-orders, /api/conflicts
app.use('/api', complaintRoutes);      // /api/community/complaints, /api/complaints/:id/*

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`RoadGuard admin backend listening on :${PORT}`));
