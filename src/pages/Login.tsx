import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { GraduationCap, Users, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const validateEmail = (email: string) => {
    // Allows only @gmail.com and @bmsit.in domains
    return /^[a-zA-Z0-9._%+-]+@(gmail\.com|bmsit\.in)$/.test(email);
  };

  const handleLogin = (role: UserRole) => {
    if (!email) {
      setError('EMAIL_REQUIRED');
      return;
    }
    if (!validateEmail(email)) {
      setError('INVALID_DOMAIN (ONLY @GMAIL.COM OR @BMSIT.IN)');
      return;
    }
    login(role, email);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full brutal-card bg-yellow-400 space-y-8">
        <div className="text-center space-y-2 border-b-2 border-black pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white border-2 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tighter">CAMPUS_OS</h1>
          <p className="font-mono text-sm">SELECT_ACCESS_LEVEL</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-mono font-bold text-sm mb-1">ENTER_EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className={`brutal-input ${error ? 'border-red-600 bg-red-50' : ''}`}
              placeholder="user@campus.edu"
            />
            {error && <p className="text-red-600 font-mono text-xs mt-1 font-bold">ERROR: {error}</p>}
          </div>

          <div className="pt-4 space-y-4">
            <button
              onClick={() => handleLogin('student')}
              className="w-full brutal-btn flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <GraduationCap className="w-6 h-6" />
                <div className="text-left">
                  <h3 className="font-bold">STUDENT</h3>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleLogin('faculty')}
              className="w-full brutal-btn flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6" />
                <div className="text-left">
                  <h3 className="font-bold">FACULTY</h3>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleLogin('admin')}
              className="w-full brutal-btn flex items-center justify-between group bg-black text-white hover:bg-gray-900"
            >
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6" />
                <div className="text-left">
                  <h3 className="font-bold">ADMIN</h3>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="text-center font-mono text-xs pt-4 border-t-2 border-black opacity-50">
          SECURE_CONNECTION // v1.0.0
        </div>
      </div>
    </div>
  );
}
