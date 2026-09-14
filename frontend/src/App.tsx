import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { SearchPage } from './features/search/SearchPage';
import { LeadsPage } from './features/leads/LeadsPage';
import { KanbanPage } from './features/kanban/KanbanPage';
import { MapPage } from './features/map/MapPage';
import { CampaignsPage } from './features/campaigns/CampaignsPage';
import { MessagesPage } from './features/messages/MessagesPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { HistoryPage } from './features/history/HistoryPage';
import { SettingsPage } from './features/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
