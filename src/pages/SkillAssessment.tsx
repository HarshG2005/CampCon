import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Play, Award } from 'lucide-react';
import { campusApi } from '../services/campus-api';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function SkillAssessment() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{score: number, total: number} | null>(null);

  useEffect(() => {
    campusApi.getAssessments().then(setAssessments);
  }, []);

  const startAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setAnswers({});
    setResult(null);
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitAssessment = async () => {
    if (!activeAssessment) return;
    
    let score = 0;
    activeAssessment.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    setResult({ score, total: activeAssessment.questions.length });
    
    // Save result
    await campusApi.submitAssessmentResult({
      assessment_id: activeAssessment.id,
      score,
      total_score: activeAssessment.questions.length
    });
  };

  if (activeAssessment) {
    if (result) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="brutal-card bg-yellow-400 text-center py-12">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold font-display mb-2">ASSESSMENT COMPLETE</h2>
            <p className="font-mono text-xl">SCORE: {result.score} / {result.total}</p>
            <div className="mt-8">
              <button onClick={() => setActiveAssessment(null)} className="brutal-btn bg-black text-white">
                RETURN_TO_LIST
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b-2 border-black pb-4">
          <h2 className="text-2xl font-bold font-display">{activeAssessment.title}</h2>
          <span className="font-mono text-sm bg-gray-200 px-2 py-1 border border-black">
            {Object.keys(answers).length} / {activeAssessment.questions.length} ANSWERED
          </span>
        </div>

        <div className="space-y-8">
          {activeAssessment.questions.map((q, idx) => (
            <div key={q.id} className="brutal-card">
              <h3 className="font-bold font-mono text-lg mb-4">
                {idx + 1}. {q.text}
              </h3>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswer(q.id, optIdx)}
                    className={`w-full text-left p-3 font-mono border-2 border-black transition-all ${
                      answers[q.id] === optIdx 
                        ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' 
                        : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={submitAssessment}
            disabled={Object.keys(answers).length !== activeAssessment.questions.length}
            className="brutal-btn bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SUBMIT_ASSESSMENT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">SKILL_ASSESSMENT</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {assessments.map(assessment => (
          <div key={assessment.id} className="brutal-card group hover:bg-blue-50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold font-display">{assessment.title}</h3>
              <span className="font-mono text-xs bg-gray-200 px-2 py-1 border border-black">
                {assessment.questions.length} Qs
              </span>
            </div>
            <p className="font-mono text-sm text-gray-600 mb-6">{assessment.description}</p>
            <button 
              onClick={() => startAssessment(assessment)}
              className="brutal-btn w-full flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> START_TEST
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
