require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const workOrdersRouter = require('./routes/workOrders');
const complaintsRouter = require('./routes/complaints');
const conflictsRouter = require('./routes/conflicts');
const usersRouter = require('./routes/users');
const noticesRouter = require('./routes/notices');
const { authenticate } = require('./middleware/auth');

const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));


app.use('/api/auth', authRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/conflicts', conflictsRouter);
app.use('/api/users', authenticate, usersRouter);
app.use('/api/notices', authenticate, noticesRouter);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`RoadGuard AI backend running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use. Try freeing port ${PORT} or setting PORT in .env.`);
  } else {
    console.error('❌ Server error:', err);
  }
});

module.exports = { app, server };