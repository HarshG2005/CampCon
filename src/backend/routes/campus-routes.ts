import { Router } from 'express';
import Database from 'better-sqlite3';
import { CampusAIService } from '../services/ai-service';

export function createCampusRoutes(db: Database.Database, aiService: CampusAIService) {
  const router = Router();

  // --- Notices ---
  router.get('/notices', (req, res) => {
    const notices = db.prepare("SELECT * FROM notices ORDER BY created_at DESC").all();
    res.json(notices);
  });

  router.post('/notices', (req, res) => {
    const { title, content, posted_by, send_email } = req.body;
    const result = db.prepare(
      "INSERT INTO notices (title, content, posted_by, sent_via_email) VALUES (?, ?, ?, ?)"
    ).run(title, content, posted_by || 1, send_email ? 1 : 0);
    
    if (send_email) {
      console.log(`[EMAIL SERVICE] Sending notice "${title}" to all students...`);
    }
    
    res.json({ id: result.lastInsertRowid, success: true });
  });

  // --- Jobs ---
  router.get('/jobs', (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY posted_at DESC").all();
    res.json(jobs);
  });

  // --- Study Plans ---
  router.get('/study-plans', (req, res) => {
    const plans = db.prepare("SELECT * FROM study_plans ORDER BY created_at DESC").all();
    res.json(plans);
  });
  
  router.post('/study-plans', (req, res) => {
    const { user_id, subject, plan_json } = req.body;
    const result = db.prepare(
      "INSERT INTO study_plans (user_id, subject, plan_json) VALUES (?, ?, ?)"
    ).run(user_id || 2, subject, JSON.stringify(plan_json));
    res.json({ id: result.lastInsertRowid, success: true });
  });

  // --- AI Features (Backend Proxy) ---
  
  // 1. Generate Study Plan
  router.post('/ai/study-plan', async (req, res) => {
    try {
      const { syllabus } = req.body;
      const plan = await aiService.generateStudyPlan(syllabus);
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate study plan" });
    }
  });

  // 2. Mock Interview
  router.post('/ai/interview', async (req, res) => {
    try {
      const { context } = req.body;
      const response = await aiService.generateInterviewQuestion(context);
      res.json({ response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate interview" });
    }
  });

  return router;
}
