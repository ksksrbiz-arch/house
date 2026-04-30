import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import DealDetail from './pages/DealDetail';
import Inspections from './pages/Inspections';
import Tenants from './pages/Tenants';
import Compliance from './pages/Compliance';
import Finances from './pages/Finances';
import Market from './pages/Market';
import Lenders from './pages/Lenders';
import Reports from './pages/Reports';
import Documents from './pages/Documents';

const NAV_ITEMS = [
  { to: '/dashboard', label: '🏠 Dashboard' },
  { to: '/deals', label: '📋 Deals' },
  { to: '/inspections', label: '🔍 Inspections' },
  { to: '/tenants', label: '👥 Tenants' },
  { to: '/compliance', label: '📅 Compliance' },
  { to: '/finances', label: '💰 Finances' },
  { to: '/market', label: '🗺️ Market' },
  { to: '/lenders', label: '🏦 Lenders' },
  { to: '/documents', label: '📄 Documents' },
  { to: '/reports', label: '📊 Reports' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-cathedral-navy-DEFAULT flex-shrink-0 flex flex-col">
          <div className="px-6 py-5 border-b border-cathedral-navy-800">
            <h1 className="text-cathedral-gold-DEFAULT font-bold text-xl tracking-wide">
              Cathedral
            </h1>
            <p className="text-cathedral-navy-300 text-xs mt-0.5">Acquisitions</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-cathedral-navy-800 text-cathedral-navy-400 text-xs">
            v0.1.0 — Single Tenant
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-cathedral-navy-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:id" element={<DealDetail />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/market" element={<Market />} />
            <Route path="/lenders" element={<Lenders />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
