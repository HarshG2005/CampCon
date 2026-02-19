import express from "express";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { createCampusRoutes } from "./src/backend/routes/campus-routes";
import { CampusAIService } from "./src/backend/services/ai-service";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("campus.db");

// Initialize Database (Using the schema we defined)
const schema = fs.readFileSync(path.join(__dirname, 'src/backend/db/schema.sql'), 'utf8');
db.exec(schema);

// Seed some data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run("System Admin", "admin@campus.edu", "admin");
  db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run("Dr. Faculty", "faculty@campus.edu", "faculty");
  db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run("John Student", "student@campus.edu", "student");
  
  db.prepare("INSERT INTO jobs (title, company, description, requirements) VALUES (?, ?, ?, ?)").run(
    "Software Engineer Intern",
    "TechCorp",
    "Join our team to build the future of AI.",
    "React, Node.js, TypeScript"
  );

  // Seed Calendar
  db.prepare("INSERT INTO calendar_events (title, event_date, event_type, description) VALUES (?, ?, ?, ?)").run("Mid-Term Exams", "2026-03-15", "exam", "Computer Science Department");
  db.prepare("INSERT INTO calendar_events (title, event_date, event_type, description) VALUES (?, ?, ?, ?)").run("Spring Break", "2026-04-01", "holiday", "No classes");
  
  // Seed Assessment
  const sampleQuestions = [
    { id: 1, text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], correctAnswer: 1 },
    { id: 2, text: "Which HTTP method is used to create a resource?", options: ["GET", "PUT", "POST", "DELETE"], correctAnswer: 2 }
  ];
  db.prepare("INSERT INTO assessments (title, description, questions_json) VALUES (?, ?, ?)").run("CS Fundamentals", "Basic knowledge check", JSON.stringify(sampleQuestions));

  // Seed Study Material
  db.prepare("INSERT INTO study_materials (title, description, link, category, uploaded_by) VALUES (?, ?, ?, ?, ?)").run("Data Structures Notes", "Comprehensive guide to DSA", "https://example.com/dsa-notes.pdf", "CS", 2);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize AI Service
  const aiService = new CampusAIService(process.env.GEMINI_API_KEY || "");

  // Mount Campus Routes
  app.use('/api', createCampusRoutes(db, aiService));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
