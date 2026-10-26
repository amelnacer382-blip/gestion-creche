import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database';
import { sectionsRouter } from './routes/sections';
import { childrenRouter } from './routes/children';
import { attendanceRouter } from './routes/attendance';
import { dailyLogsRouter } from './routes/dailyLogs';
import { staffRouter } from './routes/staff';
import { billingRouter } from './routes/billing';
import { statsRouter } from './routes/stats';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5050;

// Initialize SQLite database schema
initDatabase();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sections', sectionsRouter);
app.use('/api/children', childrenRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/daily-logs', dailyLogsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/invoices', billingRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Crèche Facile API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Crèche Facile démarré sur http://localhost:${PORT}`);
});

export default app;
