import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, ExternalLink } from 'lucide-react';
import { campusApi } from '../services/campus-api';
import { useAuth } from '../context/AuthContext';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  link: string;
  category: string;
  created_at: string;
}

export default function StudyMaterial() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', link: '', category: 'General' });
  const { user } = useAuth();

  const canUpload = user?.role === 'admin' || user?.role === 'faculty';

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const data = await campusApi.getStudyMaterials();
    setMaterials(data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await campusApi.postStudyMaterial({ ...newMaterial, uploaded_by: user?.id });
    setNewMaterial({ title: '', description: '', link: '', category: 'General' });
    setIsUploading(false);
    fetchMaterials();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-display bg-black text-white px-4 py-1 inline-block">STUDY_MATERIAL</h2>
        {canUpload && (
          <button 
            onClick={() => setIsUploading(!isUploading)}
            className="brutal-btn flex items-center gap-2 bg-yellow-400"
          >
            <Upload className="w-4 h-4" /> UPLOAD_RESOURCE
          </button>
        )}
      </div>

      {isUploading && (
        <div className="brutal-card bg-blue-50 animate-in slide-in-from-top-4">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block font-mono font-bold text-sm mb-1">TITLE</label>
              <input
                type="text"
                required
                value={newMaterial.title}
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                className="brutal-input"
                placeholder="Resource Title"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-sm mb-1">DESCRIPTION</label>
              <input
                type="text"
                value={newMaterial.description}
                onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                className="brutal-input"
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono font-bold text-sm mb-1">LINK / URL</label>
                <input
                  type="url"
                  required
                  value={newMaterial.link}
                  onChange={e => setNewMaterial({...newMaterial, link: e.target.value})}
                  className="brutal-input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block font-mono font-bold text-sm mb-1">CATEGORY</label>
                <input
                  type="text"
                  required
                  value={newMaterial.category}
                  onChange={e => setNewMaterial({...newMaterial, category: e.target.value})}
                  className="brutal-input"
                  placeholder="e.g. CS, Math, Physics"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsUploading(false)} className="brutal-btn bg-white">CANCEL</button>
              <button type="submit" className="brutal-btn bg-black text-white">UPLOAD</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((item) => (
          <div key={item.id} className="brutal-card group hover:bg-yellow-50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono bg-black text-white px-2 py-0.5">{item.category}</span>
                <FileText className="w-6 h-6 text-gray-400 group-hover:text-black" />
              </div>
              <h3 className="text-xl font-bold font-display mb-2">{item.title}</h3>
              <p className="font-mono text-sm text-gray-600 mb-4">{item.description}</p>
            </div>
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="brutal-btn w-full flex items-center justify-center gap-2 text-sm py-2"
            >
              ACCESS_RESOURCE <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
