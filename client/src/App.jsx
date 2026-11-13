import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { Layout } from './components/Layout.jsx';

// Pages
import { Dashboard } from './pages/Dashboard.jsx';
import { AgentStudio } from './pages/AgentStudio.jsx';
import { Campaigns } from './pages/Campaigns.jsx';
import { CampaignDetail } from './pages/CampaignDetail.jsx';
import { Leads } from './pages/Leads.jsx';
import { CallHistory } from './pages/CallHistory.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Integrations } from './pages/Integrations.jsx';
import { Settings } from './pages/Settings.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agent" element={<AgentStudio />} />
                <Route path="/employees" element={<Navigate to="/agent" replace />} />
                <Route path="/employees/new" element={<Navigate to="/agent" replace />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/calls" element={<CallHistory />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
