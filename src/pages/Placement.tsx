import React, { useState, useEffect } from 'react';
import { Briefcase, MessageSquare, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function Placement() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'interview'>('jobs');
  const [interviewContext, setInterviewContext] = useState('');
  const [interviewResponse, setInterviewResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/jobs').then(res => res.json()).then(setJobs);
  }, []);

  const startMockInterview = async () => {
    if (!interviewContext) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        I am preparing for an interview for the following role/company: "${interviewContext}".
        Please act as a strict interviewer. Ask me 3 challenging technical questions and 1 behavioral question relevant to this role.
        Format the output clearly.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      setInterviewResponse(result.text || "No response generated.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">PLACEMENT_HUB</h2>

      <div className="flex gap-4 border-b-2 border-black pb-1">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`font-mono font-bold px-4 py-2 transition-all ${activeTab === 'jobs' ? 'bg-blue-700 text-white shadow-[4px_4px_0px_0px_#000]' : 'hover:bg-gray-200'}`}
        >
          JOB_LISTINGS
        </button>
        <button 
          onClick={() => setActiveTab('interview')}
          className={`font-mono font-bold px-4 py-2 transition-all ${activeTab === 'interview' ? 'bg-blue-700 text-white shadow-[4px_4px_0px_0px_#000]' : 'hover:bg-gray-200'}`}
        >
          AI_MOCK_INTERVIEW
        </button>
      </div>

      {activeTab === 'jobs' ? (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="brutal-card hover:translate-x-1 transition-transform">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold font-display">{job.title}</h3>
                  <p className="font-mono font-bold text-blue-700">{job.company}</p>
                </div>
                <button className="brutal-btn py-2 px-4 text-sm bg-yellow-400">APPLY_NOW</button>
              </div>
              <p className="mt-4 font-mono text-sm text-gray-600">{job.description}</p>
              <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                <p className="text-xs font-mono font-bold">REQ: {job.requirements}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="brutal-card bg-white">
              <label className="block font-mono font-bold text-sm mb-2">TARGET_ROLE_CONTEXT</label>
              <textarea
                value={interviewContext}
                onChange={(e) => setInterviewContext(e.target.value)}
                className="brutal-input h-32"
                placeholder="E.g. Frontend Developer at Google, or Data Scientist at Amazon..."
              />
              <button
                onClick={startMockInterview}
                disabled={loading}
                className="mt-4 w-full brutal-btn bg-black text-white"
              >
                {loading ? 'INITIALIZING...' : 'START_SIMULATION'}
              </button>
            </div>
          </div>
          
          <div className="brutal-card bg-gray-100 min-h-[400px]">
            {interviewResponse ? (
              <div className="prose font-mono text-sm">
                <h3 className="font-bold border-b-2 border-black pb-2 mb-4">INTERVIEWER_BOT:</h3>
                <div className="whitespace-pre-wrap">{interviewResponse}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 font-mono">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>READY_TO_START</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
