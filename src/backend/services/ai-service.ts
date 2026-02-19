import { GoogleGenAI, Type } from "@google/genai";

export class CampusAIService {
  private ai: GoogleGenAI;
  private modelName = "gemini-3-flash-preview";

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generates a structured study plan from a syllabus.
   */
  async generateStudyPlan(syllabus: string) {
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

    const result = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const text = result.text;
    if (!text) throw new Error("Failed to generate study plan");
    
    return JSON.parse(text);
  }

  /**
   * Conducts a mock interview turn.
   */
  async generateInterviewQuestion(context: string) {
    const prompt = `
      I am preparing for an interview for the following role/company: "${context}".
      Please act as a strict interviewer. Ask me 3 challenging technical questions and 1 behavioral question relevant to this role.
      Format the output clearly.
    `;

    const result = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return result.text || "No response generated.";
  }

  /**
   * Creates a chat session for the Campus Agent with tools.
   * Returns the chat object which can be used to send messages.
   */
  createAgentChat(history: { role: string; text: string }[]) {
    const tools = [
      {
        functionDeclarations: [
          {
            name: "post_notice",
            description: "Post a new notice to the campus board.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The title of the notice" },
                content: { type: Type.STRING, description: "The full content of the notice" },
                send_email: { type: Type.BOOLEAN, description: "Whether to email all students" }
              },
              required: ["title", "content"]
            }
          },
          {
            name: "navigate",
            description: "Navigate to a specific page.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                page: { 
                  type: Type.STRING, 
                  enum: ["dashboard", "notices", "study-plan", "placement"]
                }
              },
              required: ["page"]
            }
          }
        ]
      }
    ];

    return this.ai.chats.create({
      model: this.modelName,
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: "You are the CampusOS Controller. Efficient, precise, helpful.",
        tools: tools,
      }
    });
  }
}
