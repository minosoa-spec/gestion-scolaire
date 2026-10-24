import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmModal';
import NavBar from './components/NavBar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import MotDePasseOublie from './pages/MotDePasseOublie';
import Dashboard from './pages/Dashboard';
import ListeEleves from './pages/ListeEleves';
import ListeClasses from './pages/ListeClasses';
import ListeMatieres from './pages/ListeMatieres';
import ListeNotes from './pages/ListeNotes';
import ListeInscriptions from './pages/ListeInscriptions';
import ListeEnseignants from './pages/ListeEnseignants';
import ListeAbsences from './pages/ListeAbsences';
import ListeTuteurs from './pages/ListeTuteurs';
import ListeEleveTuteurs from './pages/ListeEleveTuteurs';
import ListeAffectations from './pages/ListeAffectations';
import ListeEmploiDuTemps from './pages/ListeEmploiDuTemps';
import Bulletin from './pages/Bulletin';
import ListeComptesEnAttente from './pages/ListeComptesEnAttente';
import ListeDemandesReinitialisation from './pages/ListeDemandesReinitialisation';

function RouteProtegee({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <NavBar open={menuOpen} onClose={() => setMenuOpen(false)} />
        {user && menuOpen && (
          <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
        )}
        {user && <Header onMenuClick={() => setMenuOpen((v) => !v)} />}
        <div
          className="app-content"
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: user ? 220 : 0,
            marginTop: user ? 64 : 0,
            transition: 'margin-left 0.15s ease',
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
            <Route path="/dashboard" element={<RouteProtegee><Dashboard /></RouteProtegee>} />
            <Route path="/eleves" element={<RouteProtegee><ListeEleves /></RouteProtegee>} />
            <Route path="/classes" element={<RouteProtegee><ListeClasses /></RouteProtegee>} />
            <Route path="/matieres" element={<RouteProtegee><ListeMatieres /></RouteProtegee>} />
            <Route path="/notes" element={<RouteProtegee><ListeNotes /></RouteProtegee>} />
            <Route path="/inscriptions" element={<RouteProtegee><ListeInscriptions /></RouteProtegee>} />
            <Route path="/enseignants" element={<RouteProtegee><ListeEnseignants /></RouteProtegee>} />
            <Route path="/absences" element={<RouteProtegee><ListeAbsences /></RouteProtegee>} />
            <Route path="/tuteurs" element={<RouteProtegee><ListeTuteurs /></RouteProtegee>} />
            <Route path="/eleve-tuteurs" element={<RouteProtegee><ListeEleveTuteurs /></RouteProtegee>} />
            <Route path="/affectations" element={<RouteProtegee><ListeAffectations /></RouteProtegee>} />
            <Route path="/emploi-du-temps" element={<RouteProtegee><ListeEmploiDuTemps /></RouteProtegee>} />
            <Route path="/bulletin" element={<RouteProtegee><Bulletin /></RouteProtegee>} />
            <Route path="/comptes-en-attente" element={<RouteProtegee><ListeComptesEnAttente /></RouteProtegee>} />
            <Route path="/demandes-reinitialisation" element={<RouteProtegee><ListeDemandesReinitialisation /></RouteProtegee>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;