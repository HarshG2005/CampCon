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

export interface AgentMessage {
  role: 'user' | 'model';
  text: string;
}
