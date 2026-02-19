import React, { useState, useEffect } from 'react';
import AgentChat from '../components/AgentChat';
import { ArrowRight, BookOpen, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { campusApi } from '../services/campus-api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({ notices: 0, jobs: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const notices = await campusApi.getNotices();
      const jobs = await campusApi.getJobs();
      setStats({ notices: notices.length, jobs: jobs.length });
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold font-display">WELCOME_BACK, {user?.name.toUpperCase()}</h1>
          <p className="font-mono text-sm mt-1">SYSTEM_STATUS: ONLINE // {user?.role.toUpperCase()}_MODE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Agent Interface */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <span className="bg-black text-white px-2">AGENT_INTERFACE</span>
          </h2>
          <AgentChat />
        </div>

        {/* Quick Stats / Actions */}
        <div className="space-y-6">
          <div className="brutal-card bg-yellow-400">
            <h3 className="font-bold font-display text-xl mb-2">SYSTEM_OVERVIEW</h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between border-b border-black pb-1">
                <span>ACTIVE_NOTICES</span>
                <span className="font-bold">{stats.notices}</span>
              </div>
              <div className="flex justify-between border-b border-black pb-1">
                <span>JOB_LISTINGS</span>
                <span className="font-bold">{stats.jobs}</span>
              </div>
              <div className="flex justify-between">
                <span>USER_ROLE</span>
                <span>{user?.role.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <Link to="/notices" className="brutal-btn flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>READ NOTICES</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {user?.role === 'student' && (
              <Link to="/study-plan" className="brutal-btn flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>STUDY PLANNER</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <div className="brutal-card bg-gray-100 border-dashed flex items-center justify-center p-4">
                <span className="font-mono text-sm text-gray-500">ADMIN_CONTROLS_ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
