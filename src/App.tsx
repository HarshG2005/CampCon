/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Notices from './pages/Notices';
import StudyPlan from './pages/StudyPlan';
import Placement from './pages/Placement';
import Login from './pages/Login';
import StudyMaterial from './pages/StudyMaterial';
import SkillAssessment from './pages/SkillAssessment';
import AcademicCalendar from './pages/AcademicCalendar';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="notices" element={<Notices />} />
              <Route path="study-plan" element={<StudyPlan />} />
              <Route path="materials" element={<StudyMaterial />} />
              <Route path="assessment" element={<SkillAssessment />} />
              <Route path="calendar" element={<AcademicCalendar />} />
              <Route path="placement" element={<Placement />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
