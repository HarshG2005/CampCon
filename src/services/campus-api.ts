import { GoogleGenAI } from "@google/genai";

const API_BASE = '/api';

export const campusApi = {
  // Notices
  getNotices: async () => {
    const res = await fetch(`${API_BASE}/notices`);
    return res.json();
  },
  
  postNotice: async (notice: { title: string; content: string; send_email: boolean; category: 'admin' | 'student' }) => {
    const res = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    return res.json();
  },

  deleteNotice: async (id: number) => {
    const res = await fetch(`${API_BASE}/notices/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Jobs
  getJobs: async () => {
    const res = await fetch(`${API_BASE}/jobs`);
    return res.json();
  },

  // Study Plans
  saveStudyPlan: async (plan: { subject: string; plan_json: any }) => {
    const res = await fetch(`${API_BASE}/study-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    return res.json();
  },

  updateStudyPlan: async (id: number, plan_json: any) => {
    const res = await fetch(`${API_BASE}/study-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_json }),
    });
    return res.json();
  },

  getStudyPlans: async () => {
    const res = await fetch(`${API_BASE}/study-plans`);
    return res.json();
  },

  // Study Materials
  getStudyMaterials: async () => {
    const res = await fetch(`${API_BASE}/study-materials`);
    return res.json();
  },
  postStudyMaterial: async (material: any) => {
    const res = await fetch(`${API_BASE}/study-materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(material),
    });
    return res.json();
  },

  // Assessments
  getAssessments: async () => {
    const res = await fetch(`${API_BASE}/assessments`);
    return res.json();
  },
  submitAssessmentResult: async (result: any) => {
    const res = await fetch(`${API_BASE}/assessment-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    return res.json();
  },

  // Calendar
  getCalendarEvents: async () => {
    const res = await fetch(`${API_BASE}/calendar-events`);
    return res.json();
  },
  
  // AI Agent
  getGenAIModel: () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return ai.models;
  },
  
  createChat: (history: any[], tools?: any[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return ai.chats.create({
      model: "gemini-3-flash-preview",
      history,
      config: {
        systemInstruction: "You are the CampusOS Controller. You are efficient, precise, and helpful. You control the campus events and data. Speak in a slightly robotic but friendly tone. When asked to post notices, ensure they are professional.",
        tools,
      }
    });
  }
};
