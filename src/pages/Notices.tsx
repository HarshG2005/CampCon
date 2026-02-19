import React, { useState, useEffect } from 'react';
import { Plus, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { campusApi } from '../services/campus-api';

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
  sent_via_email: number;
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', send_email: false });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const data = await campusApi.getNotices();
    setNotices(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await campusApi.postNotice(newNotice);
    setNewNotice({ title: '', content: '', send_email: false });
    setIsCreating(false);
    fetchNotices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">NOTICE_BOARD</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="brutal-btn flex items-center gap-2 bg-yellow-400"
        >
          <Plus className="w-4 h-4" /> POST_NOTICE
        </button>
      </div>

      {isCreating && (
        <div className="brutal-card bg-blue-50 animate-in slide-in-from-top-4">
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
                className="w-5 h-5 border-2 border-black rounded-none focus:ring-0 text-black"
              />
              <label htmlFor="email" className="font-mono font-bold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" /> SEND EMAIL BLAST TO ALL STUDENTS
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
        {notices.map((notice) => (
          <div key={notice.id} className="brutal-card group hover:bg-yellow-50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold font-display">{notice.title}</h3>
                <p className="text-xs font-mono text-gray-500 mt-1">
                  {format(new Date(notice.created_at), 'yyyy-MM-dd HH:mm')} // ADMIN
                </p>
              </div>
              {notice.sent_via_email === 1 && (
                <span className="bg-blue-700 text-white text-xs font-mono px-2 py-1 border border-black">
                  EMAILED
                </span>
              )}
            </div>
            <p className="font-mono text-sm whitespace-pre-wrap">{notice.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
