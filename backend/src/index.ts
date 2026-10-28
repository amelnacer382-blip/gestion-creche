import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './db/database';
import { sectionsRouter } from './routes/sections';
import { childrenRouter } from './routes/children';
import { attendanceRouter } from './routes/attendance';
import { dailyLogsRouter } from './routes/dailyLogs';
import { staffRouter } from './routes/staff';
import { billingRouter } from './routes/billing';
import { statsRouter } from './routes/stats';
import { feedRouter } from './routes/feed';
import { vaccinationsRouter } from './routes/vaccinations';
import { announcementsRouter } from './routes/announcements';
import { menuRouter } from './routes/menu';
import { milestonesRouter } from './routes/milestones';
import { liaisonRouter } from './routes/liaison';
import { remindersRouter } from './routes/reminders';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5050;

// Initialize SQLite database schema
initDatabase();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/sections', sectionsRouter);
app.use('/api/children', childrenRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/daily-logs', dailyLogsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/invoices', billingRouter);
app.use('/api/stats', statsRouter);
app.use('/api/feed', feedRouter);
app.use('/api/vaccinations', vaccinationsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/weekly-menu', menuRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/liaison', liaisonRouter);
app.use('/api/reminders', remindersRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Crèche Facile API',
    version: '1.4.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist if available (Production single-port mode)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Crèche Facile démarré sur http://localhost:${PORT}`);
});

export default app;
