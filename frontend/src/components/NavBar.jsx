import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  ClipboardList,
  UserPlus,
  GraduationCap,
  CalendarX,
  UserCheck,
  Link2,
  ListChecks,
  CalendarClock,
  FileText,
  LogOut,
  UserCog,
  KeyRound,
  X,
} from 'lucide-react';

function NavBar({ open = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [photoUser, setPhotoUser] = useState('');

  useEffect(() => {
    if (!user) return;
    const role = user.role?.toUpperCase();

    if (role === 'ELEVE') {
      api.get('eleves/')
        .then((res) => {
          const moi = res.data.find((e) => e.user === user.id);
          if (moi?.photo) setPhotoUser(moi.photo);
        })
        .catch(() => {});
    } else if (role === 'ENSEIGNANT') {
      api.get('enseignants/')
        .then((res) => {
          const moi = res.data.find((e) => e.user === user.id);
          if (moi?.photo) setPhotoUser(moi.photo);
        })
        .catch(() => {});
    }
  }, [user]);

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const links = [
    { to: '/dashboard', label: 'Accueil', icon: LayoutDashboard, roles: ['admin', 'enseignant', 'eleve'] },
    { to: '/eleves', label: 'Élèves', icon: Users, roles: ['admin', 'enseignant'] },
    { to: '/classes', label: 'Classes', icon: School, roles: ['admin', 'enseignant'] },
    { to: '/matieres', label: 'Matières', icon: BookOpen, roles: ['admin', 'enseignant'] },
    { to: '/notes', label: 'Notes', icon: ClipboardList, roles: ['admin', 'enseignant', 'eleve'] },
    { to: '/inscriptions', label: 'Inscriptions', icon: UserPlus, roles: ['admin'] },
    { to: '/enseignants', label: 'Enseignants', icon: GraduationCap, roles: ['admin'] },
    { to: '/absences', label: 'Absences', icon: CalendarX, roles: ['admin', 'enseignant', 'eleve'] },
    { to: '/tuteurs', label: 'Tuteurs', icon: UserCheck, roles: ['admin'] },
    { to: '/eleve-tuteurs', label: 'Liens', icon: Link2, roles: ['admin'] },
    { to: '/affectations', label: 'Affectations', icon: ListChecks, roles: ['admin'] },
    { to: '/emploi-du-temps', label: 'Emploi du temps', icon: CalendarClock, roles: ['admin', 'enseignant', 'eleve'] },
    { to: '/bulletin', label: 'Bulletin', icon: FileText, roles: ['admin', 'enseignant', 'eleve'] },
    { to: '/comptes-en-attente', label: 'Comptes en attente', icon: UserCog, roles: ['admin'] },
    { to: '/demandes-reinitialisation', label: 'Mots de passe', icon: KeyRound, roles: ['admin'] },
  ];

  const visibleLinks = links.filter((l) => l.roles.includes(user.role?.toLowerCase()));

  const initiale = user.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <nav
      className={open ? 'sidebar open' : 'sidebar'}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <style>{`
        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          margin: 1px 8px;
          border-radius: 7px;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 12.5px;
          line-height: 1.3;
          position: relative;
          transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
        }
        .nav-link-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          padding-left: 17px;
        }
        .nav-link-item.active {
          background: rgba(99, 102, 241, 0.18);
          color: #fff;
          font-weight: 600;
        }
        .nav-link-item.active::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 4px;
          bottom: 4px;
          width: 3px;
          background: #818cf8;
          border-radius: 2px;
        }
        .logout-btn {
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .logout-btn:hover {
          background: #dc2626 !important;
        }
        .logout-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <div
        className="sidebar-header"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', flexShrink: 0 }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          🎓
        </div>
        <span className="sidebar-title" style={{ fontSize: 14, flex: 1 }}>Gestion Scolaire</span>
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Fermer le menu"
          style={{
            background: 'transparent',
            color: '#cbd5e1',
            padding: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="sidebar-links"
        style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingTop: 4, paddingBottom: 4 }}
      >
        {visibleLinks.map((l) => {
          const Icon = l.icon;
          const isActive = location.pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={isActive ? 'nav-link-item active' : 'nav-link-item'}
            >
              <Icon size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </div>

      <div
        className="sidebar-footer"
        style={{
          padding: '10px 14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {photoUser ? (
            <img
              src={photoUser}
              alt=""
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {initiale}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.username}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>
              {user.role?.toLowerCase()}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="logout-btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 0',
            background: '#475569',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

export default NavBar;