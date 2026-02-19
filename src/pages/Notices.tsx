import React, { useState, useEffect } from 'react';
import { Plus, Mail, Trash2, Shield, Users } from 'lucide-react';
import { format } from 'date-fns';
import { campusApi } from '../services/campus-api';
import { useAuth } from '../context/AuthContext';

interface Notice {
  id: number;
  title: string;
  content: string;
  category: 'admin' | 'student';
  created_at: string;
  sent_via_email: number;
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('admin');
  const [isCreating, setIsCreating] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', send_email: false });
  const { user } = useAuth();

  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';
  
  // Students can only post in student tab. Admins can post everywhere.
  const canPost = isAdminOrFaculty || activeTab === 'student';

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const data = await campusApi.getNotices();
    setNotices(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Ensure only admins/faculty can send emails
    const noticeToPost = {
      ...newNotice,
      category: activeTab,
      send_email: isAdminOrFaculty ? newNotice.send_email : false
    };

    await campusApi.postNotice(noticeToPost);
    setNewNotice({ title: '', content: '', send_email: false });
    setIsCreating(false);
    fetchNotices();
  };

  const handleDelete = async (id: number) => {
    if (confirm('ARE YOU SURE YOU WANT TO DELETE THIS NOTICE?')) {
      await campusApi.deleteNotice(id);
      fetchNotices();
    }
  };

  const filteredNotices = notices.filter(n => n.category === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">NOTICE_BOARD</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('admin')}
            className={`brutal-btn flex items-center gap-2 px-4 py-2 text-sm ${activeTab === 'admin' ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            <Shield className="w-4 h-4" /> ADMINISTRATION
          </button>
          <button 
            onClick={() => setActiveTab('student')}
            className={`brutal-btn flex items-center gap-2 px-4 py-2 text-sm ${activeTab === 'student' ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            <Users className="w-4 h-4" /> STUDENTS
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {canPost && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="brutal-btn flex items-center gap-2 bg-yellow-400 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> POST TO {activeTab.toUpperCase()}
          </button>
        )}
      </div>

      {isCreating && (
        <div className="brutal-card bg-blue-50 animate-in slide-in-from-top-4">
          <div className="mb-4 font-mono text-sm font-bold border-b-2 border-black pb-2">
            CREATING_NEW_NOTICE // TARGET: {activeTab.toUpperCase()}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono font-bold text-sm mb-1">TITLE</label>
              <input
                type="text"
                required
                value={newNotice.title}
                onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                className="brutal-input"
                placeholder="NOTICE TITLE..."
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-sm mb-1">CONTENT</label>
              <textarea
                required
                value={newNotice.content}
                onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                className="brutal-input h-32"
                placeholder="NOTICE CONTENT..."
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="email"
                checked={newNotice.send_email}
                onChange={e => setNewNotice({...newNotice, send_email: e.target.checked})}
                disabled={!isAdminOrFaculty}
                className={`w-5 h-5 border-2 border-black rounded-none focus:ring-0 text-black ${!isAdminOrFaculty ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
              />
              <label htmlFor="email" className={`font-mono font-bold text-sm flex items-center gap-2 ${!isAdminOrFaculty ? 'opacity-50' : ''}`}>
                <Mail className="w-4 h-4" /> SEND EMAIL BLAST TO ALL STUDENTS
                {!isAdminOrFaculty && <span className="text-xs text-red-600 ml-2">[ADMIN/FACULTY ONLY]</span>}
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="brutal-btn bg-white">CANCEL</button>
              <button type="submit" className="brutal-btn bg-black text-white">PUBLISH</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {filteredNotices.length === 0 && (
          <div className="brutal-card bg-gray-100 flex items-center justify-center p-8 border-dashed">
            <p className="font-mono text-gray-500">NO_NOTICES_FOUND_IN_THIS_SECTOR</p>
          </div>
        )}
        
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="brutal-card group hover:bg-yellow-50 transition-colors relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold font-display">{notice.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-mono px-2 py-0.5 border border-black ${notice.category === 'admin' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {notice.category.toUpperCase()}
                  </span>
                  <p className="text-xs font-mono text-gray-500">
                    {format(new Date(notice.created_at), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {notice.sent_via_email === 1 && (
                  <span className="bg-blue-700 text-white text-xs font-mono px-2 py-1 border border-black">
                    EMAILED
                  </span>
                )}
                
                {/* Delete button: Visible to Admins/Faculty for Student notices, or Admins for all */}
                {isAdminOrFaculty && (
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="brutal-btn p-2 bg-red-500 text-white hover:bg-red-600 border-black shadow-[2px_2px_0px_0px_#000]"
                    title="DELETE NOTICE"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="font-mono text-sm whitespace-pre-wrap">{notice.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
