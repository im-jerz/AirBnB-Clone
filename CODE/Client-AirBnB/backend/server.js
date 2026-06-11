import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/api/db/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title STRING NOT NULL,
        description STRING,
        price DECIMAL(10,2) NOT NULL,
        location STRING,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    res.json({ message: 'Database initialized' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Empress backend running on port ${PORT}`);
});
