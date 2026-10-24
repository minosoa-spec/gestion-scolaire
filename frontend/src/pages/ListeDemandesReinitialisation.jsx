import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { parseApiError } from '../utils/errorParser';
import { KeyRound, Check, X, ShieldAlert } from 'lucide-react';

function ListeDemandesReinitialisation() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ouvertId, setOuvertId] = useState(null);
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const toast = useToast();

  const charger = () => {
    setLoading(true);
    api.get('auth/demandes-reinitialisation/')
      .then((res) => { setDemandes(res.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les demandes'); setLoading(false); });
  };

  useEffect(() => { if (isAdmin) charger(); }, [isAdmin]);

  const ouvrirFormulaire = (id) => {
    setOuvertId(id);
    setNouveauMdp('');
  };

  const annuler = () => {
    setOuvertId(null);
    setNouveauMdp('');
  };

  const handleTraiter = async (id) => {
    if (nouveauMdp.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setEnvoiEnCours(true);
    try {
      await api.post(`auth/demandes-reinitialisation/${id}/traiter/`, { new_password: nouveauMdp });
      toast.success('Mot de passe réinitialisé. Communique-le à la personne concernée.');
      setOuvertId(null);
      setNouveauMdp('');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la réinitialisation.'));
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, color: '#dc2626' }}>
          <ShieldAlert size={22} />
          <p style={{ margin: 0 }}>Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 950, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <KeyRound size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Demandes de réinitialisation</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>
        Définissez un nouveau mot de passe et communiquez-le à la personne concernée.
      </p>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>{demandes.length} demande(s) en attente</p>
          {demandes.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune demande en attente. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demandes.map((d) => (
                <div key={d.id} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{d.username}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: '#eff6ff', color: '#3b82f6' }}>
                          {d.role}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                        Demandé le {new Date(d.date_demande).toLocaleString('fr-FR')}
                      </div>
                      {d.message && (
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 6, fontStyle: 'italic' }}>
                          « {d.message} »
                        </div>
                      )}
                    </div>

                    {ouvertId !== d.id && (
                      <button
                        onClick={() => ouvrirFormulaire(d.id)}
                        style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Traiter
                      </button>
                    )}
                  </div>

                  {ouvertId === d.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Nouveau mot de passe (6 caractères min.)"
                        value={nouveauMdp}
                        onChange={(e) => setNouveauMdp(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: 220 }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleTraiter(d.id)}
                        disabled={envoiEnCours}
                        style={{ padding: '9px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: envoiEnCours ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Check size={14} /> Confirmer
                      </button>
                      <button
                        onClick={annuler}
                        style={{ padding: '9px 14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <X size={14} /> Annuler
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeDemandesReinitialisation;