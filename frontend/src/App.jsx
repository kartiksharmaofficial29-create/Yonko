import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import NLPAnalysisPage from './pages/NLPAnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import MachinesPage from './pages/MachinesPage';
import TechniciansPage from './pages/TechniciansPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Dashboard Shell */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/new" element={<CreateTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailsPage />} />
        <Route path="tickets/:id/nlp" element={<NLPAnalysisPage />} />
        <Route path="tickets/:id/recommendations" element={<RecommendationsPage />} />
        <Route path="machines" element={<MachinesPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
