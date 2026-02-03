import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { EstimationPage, ExteriorEstimationPage } from './pages';
import { Button } from '@tarva/ui';
import { Home, Paintbrush } from 'lucide-react';

function Navigation() {
  return (
    <nav className="bg-card border-b print:hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-2">
          <NavLink to="/interior">
            {({ isActive }) => (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Paintbrush className="h-4 w-4" />
                Interior
              </Button>
            )}
          </NavLink>
          <NavLink to="/exterior">
            {({ isActive }) => (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Exterior
              </Button>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/interior" replace />} />
          <Route path="/interior" element={<EstimationPage />} />
          <Route path="/exterior" element={<ExteriorEstimationPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
