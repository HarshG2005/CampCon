import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Terminal, BookOpen, Bell, Briefcase, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { to: "/", icon: Terminal, label: "AGENT" },
    { to: "/notices", icon: Bell, label: "NOTICES" },
    { to: "/study-plan", icon: BookOpen, label: "STUDY PLAN" },
    { to: "/placement", icon: Briefcase, label: "PLACEMENT" },
  ];

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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-full border-2 border-black"></div>
            <div>
              <p className="font-bold text-sm">USER_01</p>
              <p className="text-xs font-mono text-gray-500">STUDENT</p>
            </div>
          </div>
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
