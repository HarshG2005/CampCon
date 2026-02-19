import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Terminal, BookOpen, Bell, Briefcase, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "DASHBOARD", roles: ['student', 'faculty', 'admin'] },
    { to: "/notices", icon: Bell, label: "NOTICES", roles: ['student', 'faculty', 'admin'] },
    { to: "/study-plan", icon: BookOpen, label: "STUDY PLAN", roles: ['student'] },
    { to: "/placement", icon: Briefcase, label: "PLACEMENT", roles: ['student'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F0F0F0]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r-2 border-black bg-white fixed h-full z-10">
        <div className="p-6 border-b-2 border-black bg-yellow-400">
          <h1 className="text-2xl font-bold font-display tracking-tighter">CAMPUS_OS</h1>
          <p className="text-xs font-mono mt-1">v1.0.0 // ONLINE</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 font-mono font-bold border-2 border-transparent transition-all",
                isActive 
                  ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]" 
                  : "hover:border-black hover:bg-gray-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-black bg-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-700 rounded-full border-2 border-black"></div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate">{user?.name.toUpperCase()}</p>
              <p className="text-xs font-mono text-gray-500">{user?.role.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono font-bold text-red-600 border-2 border-transparent hover:border-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b-2 border-black bg-yellow-400 sticky top-0 z-20">
        <h1 className="text-xl font-bold font-display">CAMPUS_OS</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-10 pt-20 px-4 space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-4 font-mono font-bold border-2 border-black",
                isActive ? "bg-black text-white" : "bg-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 font-mono font-bold border-2 border-red-600 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            LOGOUT
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
