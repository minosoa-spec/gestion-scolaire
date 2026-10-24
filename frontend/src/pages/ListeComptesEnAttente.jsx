import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { UserCog, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

function ListeComptesEnAttente() {
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const toast = useToast();
  const confirm = useConfirm();

  const charger = () => {
    setLoading(true);
    api.get('auth/comptes-en-attente/')
      .then((res) => { setComptes(res.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les comptes en attente'); setLoading(false); });
  };

  useEffect(() => { if (isAdmin) charger(); }, [isAdmin]);

  const handleValider = async (compte) => {
    const ok = await confirm({
      title: 'Valider le compte',
      message: `Voulez-vous valider le compte de ${compte.username} (${compte.role}) ? Il pourra alors se connecter.`,
      confirmLabel: 'Valider',
    });
    if (!ok) return;
    try {
      await api.post(`auth/comptes-en-attente/${compte.id}/valider/`);
      toast.success('Compte validé.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la validation.'));
    }
  };

  const handleRejeter = async (compte) => {
    const ok = await confirm({
      title: 'Rejeter le compte',
      message: `Voulez-vous rejeter et supprimer définitivement la demande de ${compte.username} ? Cette action est irréversible.`,
      confirmLabel: 'Rejeter',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.post(`auth/comptes-en-attente/${compte.id}/rejeter/`);
      toast.success('Compte rejeté.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors du rejet.'));
    }
  };

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };

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
          <UserCog size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Comptes en attente</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>
        Validez ou rejetez les nouvelles demandes d'inscription.
      </p>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>{comptes.length} compte(s) en attente</p>
          {comptes.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun compte en attente. 🎉</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Utilisateur</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Rôle</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Demandé le</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comptes.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500, color: '#1e293b' }}>{c.username}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{c.email || '—'}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#3b82f6' }}>
                          {c.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{new Date(c.date_joined).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleValider(c)}
                          title="Valider"
                          style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#ecfdf5', color: '#059669', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => handleRejeter(c)}
                          title="Rejeter"
                          style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeComptesEnAttente;