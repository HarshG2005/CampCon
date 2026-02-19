import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, CheckSquare, Square, Edit2, Save, X } from 'lucide-react';
import { campusApi } from '../services/campus-api';

interface Topic {
  text: string;
  completed: boolean;
}

interface Module {
  title: string;
  topics: Topic[];
  estimated_hours: number;
  suggested_days: string;
}

interface StudyPlanData {
  id?: number;
  subject: string;
  modules: Module[];
}

export default function StudyPlan() {
  const [syllabus, setSyllabus] = useState('');
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadLatestPlan();
  }, []);

  const loadLatestPlan = async () => {
    const plans = await campusApi.getStudyPlans();
    if (plans.length > 0) {
      const latest = plans[0];
      try {
        const parsedJson = JSON.parse(latest.plan_json);
        // Ensure structure matches new interface (migration for old data)
        const migratedModules = parsedJson.modules.map((m: any) => ({
          ...m,
          topics: m.topics.map((t: any) => 
            typeof t === 'string' ? { text: t, completed: false } : t
          )
        }));
        setPlan({ ...parsedJson, modules: migratedModules, id: latest.id });
      } catch (e) {
        console.error("Failed to parse plan", e);
      }
    }
  };

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
      
      const rawPlan = JSON.parse(responseText);
      
      // Transform strings to objects for completion tracking
      const formattedPlan: StudyPlanData = {
        subject: rawPlan.subject || "General",
        modules: rawPlan.modules.map((m: any) => ({
          ...m,
          topics: m.topics.map((t: string) => ({ text: t, completed: false }))
        }))
      };

      setPlan(formattedPlan);

      // Save to DB
      const saved = await campusApi.saveStudyPlan({
        subject: formattedPlan.subject,
        plan_json: formattedPlan
      });
      
      setPlan(prev => prev ? { ...prev, id: saved.id } : null);

    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = async (moduleIndex: number, topicIndex: number) => {
    if (!plan) return;
    
    const newModules = [...plan.modules];
    const topic = newModules[moduleIndex].topics[topicIndex];
    topic.completed = !topic.completed;
    
    const newPlan = { ...plan, modules: newModules };
    setPlan(newPlan);
    
    if (plan.id) {
      await campusApi.updateStudyPlan(plan.id, newPlan);
    }
  };

  const saveEdits = async () => {
    if (!plan || !plan.id) return;
    await campusApi.updateStudyPlan(plan.id, plan);
    setIsEditing(false);
  };

  const updateModuleTitle = (index: number, title: string) => {
    if (!plan) return;
    const newModules = [...plan.modules];
    newModules[index].title = title;
    setPlan({ ...plan, modules: newModules });
  };

  const updateTopicText = (modIndex: number, topicIndex: number, text: string) => {
    if (!plan) return;
    const newModules = [...plan.modules];
    newModules[modIndex].topics[topicIndex].text = text;
    setPlan({ ...plan, modules: newModules });
  };

  const calculateProgress = () => {
    if (!plan) return 0;
    let total = 0;
    let completed = 0;
    plan.modules.forEach(m => {
      m.topics.forEach(t => {
        total++;
        if (t.completed) completed++;
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">STUDY_PLANNER</h2>
        {plan && (
          <div className="font-mono font-bold text-sm bg-yellow-400 px-3 py-1 border-2 border-black">
            PROGRESS: {calculateProgress()}%
          </div>
        )}
      </div>
      
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
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={saveEdits} className="bg-green-600 text-white p-1 border-2 border-black hover:bg-green-700"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setIsEditing(false)} className="bg-red-600 text-white p-1 border-2 border-black hover:bg-red-700"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-white text-black p-1 border-2 border-black hover:bg-gray-100"><Edit2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                {plan.modules?.map((mod, modIdx) => (
                  <div key={modIdx} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-2">
                      {isEditing ? (
                        <input 
                          value={mod.title}
                          onChange={(e) => updateModuleTitle(modIdx, e.target.value)}
                          className="font-bold font-mono border-b-2 border-black focus:outline-none w-full mr-2 bg-yellow-50"
                        />
                      ) : (
                        <h4 className="font-bold font-mono">{mod.title}</h4>
                      )}
                      <span className="text-xs font-mono bg-gray-200 px-2 py-1 border-2 border-black whitespace-nowrap">{mod.suggested_days}</span>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      {mod.topics?.map((topic, topicIdx) => (
                        <div key={topicIdx} className="flex items-start gap-2 group">
                          <button 
                            onClick={() => !isEditing && toggleTopic(modIdx, topicIdx)}
                            className={`mt-0.5 ${isEditing ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                            disabled={isEditing}
                          >
                            {topic.completed ? (
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400 group-hover:text-black" />
                            )}
                          </button>
                          
                          {isEditing ? (
                            <input 
                              value={topic.text}
                              onChange={(e) => updateTopicText(modIdx, topicIdx, e.target.value)}
                              className="font-mono text-sm border-b border-gray-300 focus:border-black focus:outline-none w-full bg-transparent"
                            />
                          ) : (
                            <span className={`font-mono text-sm ${topic.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {topic.text}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
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
