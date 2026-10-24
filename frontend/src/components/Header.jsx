import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Search, Users, GraduationCap, School, Menu } from 'lucide-react';

function Header({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terme, setTerme] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get('eleves/'), api.get('enseignants/'), api.get('classes/')])
      .then(([eRes, ensRes, cRes]) => {
        setEleves(eRes.data);
        setEnseignants(ensRes.data);
        setClasses(cRes.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = terme.trim().toLowerCase();

  const elevesTrouves = t
    ? eleves.filter(
        (e) =>
          e.nom?.toLowerCase().includes(t) ||
          e.prenom?.toLowerCase().includes(t) ||
          e.matricule?.toLowerCase().includes(t)
      ).slice(0, 5)
    : [];
  const enseignantsTrouves = t
    ? enseignants.filter((e) => e.nom?.toLowerCase().includes(t) || e.prenom?.toLowerCase().includes(t)).slice(0, 5)
    : [];
  const classesTrouvees = t
    ? classes.filter((c) => c.nom_classe?.toLowerCase().includes(t)).slice(0, 5)
    : [];

  const aucunResultat =
    t && elevesTrouves.length === 0 && enseignantsTrouves.length === 0 && classesTrouvees.length === 0;

  const allerVers = (chemin) => {
    setTerme('');
    setOuvert(false);
    navigate(chemin);
  };

  return (
    <header
      className="top-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 220,
        right: 0,
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 24px',
        zIndex: 20,
      }}
    >
      <button
        type="button"
        className="menu-toggle"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        style={{
          width: 40,
          height: 40,
          padding: 0,
          background: '#f1f5f9',
          color: '#1e293b',
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Menu size={20} />
      </button>

      <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '9px 14px',
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            value={terme}
            onChange={(e) => {
              setTerme(e.target.value);
              setOuvert(true);
            }}
            onFocus={() => setOuvert(true)}
            placeholder="Rechercher un élève, un enseignant, une classe..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              width: '100%',
              color: '#334155',
            }}
          />
        </div>

        {ouvert && t && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              border: '1px solid #f1f5f9',
              maxHeight: 360,
              overflowY: 'auto',
              zIndex: 30,
            }}
          >
            {aucunResultat && (
              <div style={{ padding: 16, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                Aucun résultat pour "{terme}"
              </div>
            )}

            {elevesTrouves.length > 0 && (
              <div style={{ padding: '10px 0' }}>
                <div style={{ padding: '2px 14px 6px', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Élèves
                </div>
                {elevesTrouves.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => allerVers('/eleves')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer' }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <Users size={15} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{e.nom} {e.prenom}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Matricule {e.matricule}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {enseignantsTrouves.length > 0 && (
              <div style={{ padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ padding: '2px 14px 6px', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Enseignants
                </div>
                {enseignantsTrouves.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => allerVers('/enseignants')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer' }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <GraduationCap size={15} color="#f59e0b" />
                    <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{e.prenom} {e.nom}</div>
                  </div>
                ))}
              </div>
            )}

            {classesTrouvees.length > 0 && (
              <div style={{ padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ padding: '2px 14px 6px', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Classes
                </div>
                {classesTrouvees.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => allerVers('/classes')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer' }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <School size={15} color="#8b5cf6" />
                    <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                      {c.nom_classe} ({c.annee_scolaire})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;