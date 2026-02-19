import React, { useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { campusApi } from '../services/campus-api';

export default function StudyPlan() {
  const [syllabus, setSyllabus] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!syllabus) return;
    setLoading(true);
    try {
      const models = campusApi.getGenAIModel();
      
      const prompt = `
        Create a structured study plan based on this syllabus:
        ${syllabus}
        
        Return the response as a JSON object with this structure:
        {
          "subject": "Subject Name",
          "modules": [
            {
              "title": "Module Title",
              "topics": ["Topic 1", "Topic 2"],
              "estimated_hours": 5,
              "suggested_days": "Day 1-3"
            }
          ]
        }
      `;

      const result = await models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      
      const responseText = result.text;
      if (!responseText) throw new Error("No response text");
      
      const planData = JSON.parse(responseText);
      setPlan(planData);

      // Save to DB
      await campusApi.saveStudyPlan({
        subject: planData.subject || "General",
        plan_json: planData
      });

    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">STUDY_PLANNER</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="brutal-card bg-white">
            <label className="block font-mono font-bold text-sm mb-2">INPUT_SYLLABUS_DATA</label>
            <textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="brutal-input h-64 font-mono text-sm"
              placeholder="Paste your syllabus here..."
            />
            <button
              onClick={generatePlan}
              disabled={loading}
              className="mt-4 w-full brutal-btn bg-blue-700 text-white flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Calendar />}
              GENERATE_OPTIMAL_PLAN
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {plan ? (
            <div className="brutal-card bg-yellow-400 min-h-[400px]">
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
                <h3 className="font-bold font-display text-xl">{plan.subject.toUpperCase()}</h3>
                <span className="font-mono text-xs bg-black text-white px-2 py-1">GENERATED</span>
              </div>
              
              <div className="space-y-6">
                {plan.modules?.map((mod: any, idx: number) => (
                  <div key={idx} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold font-mono">{mod.title}</h4>
                      <span className="text-xs font-mono bg-gray-200 px-2 py-1 border border-black">{mod.suggested_days}</span>
                    </div>
                    <ul className="list-disc list-inside font-mono text-sm space-y-1 text-gray-700">
                      {mod.topics?.map((topic: string, i: number) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                    <div className="mt-3 text-xs font-bold text-blue-700">
                      EST. EFFORT: {mod.estimated_hours} HRS
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="brutal-card bg-gray-100 flex items-center justify-center min-h-[400px] border-dashed">
              <p className="font-mono text-gray-500">AWAITING INPUT DATA...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
