import pkg from 'pg';
const { Pool } = pkg;

// Reads PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD from process.env automatically
const pool = new Pool();

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
  process.exit(1);
});

export default pool;
