export interface Notice {
  id?: number;
  title: string;
  content: string;
  posted_by?: number;
  category: 'admin' | 'student';
  created_at?: string;
  sent_via_email: boolean;
}

export interface Job {
  id?: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  posted_at?: string;
}

export interface StudyPlan {
  id?: number;
  user_id?: number;
  subject: string;
  plan_json: any;
  created_at?: string;
}

export interface StudyMaterial {
  id?: number;
  title: string;
  description: string;
  link: string;
  category: string;
  uploaded_by?: number;
  created_at?: string;
}

export interface Assessment {
  id?: number;
  title: string;
  description: string;
  questions: {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number; // index
  }[];
}

export interface AssessmentResult {
  id?: number;
  user_id: number;
  assessment_id: number;
  score: number;
  total_score: number;
  completed_at?: string;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  event_date: string;
  event_type: 'exam' | 'holiday' | 'event' | 'deadline';
  description: string;
}

export interface AgentMessage {
  role: 'user' | 'model';
  text: string;
}
