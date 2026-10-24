import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { UserCheck, Search, Plus, Pencil, Trash2, X, Phone, MapPin } from 'lucide-react';

const EMPTY_FORM = { nom: '', prenom: '', telephone: '', adresse: '', profession: '' };

function ListeTuteurs() {
  const [tuteurs, setTuteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [recherche, setRecherche] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const toast = useToast();
  const confirm = useConfirm();

  const charger = () => {
    setLoading(true);
    api.get('tuteurs/')
      .then((res) => { setTuteurs(res.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les tuteurs'); setLoading(false); });
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`tuteurs/${editingId}/`, form);
        toast.success('Tuteur modifié avec succès.');
      } else {
        await api.post('tuteurs/', form);
        toast.success('Tuteur ajouté avec succès.');
      }
      resetForm();
      charger();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({ nom: t.nom || '', prenom: t.prenom || '', telephone: t.telephone || '', adresse: t.adresse || '', profession: t.profession || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (t) => {
    const ok = await confirm({
      title: 'Supprimer le tuteur',
      message: `Voulez-vous vraiment supprimer ${t.prenom} ${t.nom} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`tuteurs/${t.id}/`);
      toast.success('Tuteur supprimé.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const initiales = (nom, prenom) => `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase() || '?';

  const termeRecherche = recherche.trim().toLowerCase();
  const tuteursFiltres = tuteurs.filter((t) => {
    if (!termeRecherche) return true;
    return (
      t.nom?.toLowerCase().includes(termeRecherche) ||
      t.prenom?.toLowerCase().includes(termeRecherche) ||
      t.profession?.toLowerCase().includes(termeRecherche)
    );
  });

  const { page, setPage, totalPages, itemsPage, resetPage } = usePagination(tuteursFiltres, 10);

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCheck size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des tuteurs</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Consultez et gérez les tuteurs des élèves.</p>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier un tuteur' : 'Ajouter un tuteur'}
          </h3>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-line' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Nom</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Prénom</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="prenom" value={form.prenom} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Téléphone</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="telephone" value={form.telephone} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Profession</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="profession" value={form.profession} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Adresse</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="adresse" value={form.adresse} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : 'Ajouter le tuteur'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={15} /> Annuler
              </button>
            )}
          </div>
        </form>
      )}

      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" placeholder="Rechercher par nom, prénom ou profession..." value={recherche} onChange={(e) => { setRecherche(e.target.value); resetPage(); }} style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
            {tuteursFiltres.length} tuteur(s) {termeRecherche && `trouvé(s) pour "${recherche}"`}
          </p>
          {tuteursFiltres.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun tuteur trouvé.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Tuteur</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Profession</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Contact</th>
                      {isAdmin && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>
                              {initiales(t.nom, t.prenom)}
                            </div>
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{t.prenom} {t.nom}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          {t.profession ? (
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                              {t.profession}
                            </span>
                          ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#64748b', fontSize: 13 }}>
                            {t.telephone && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} />{t.telephone}</div>}
                            {t.adresse && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} />{t.adresse}</div>}
                          </div>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <button onClick={() => handleEdit(t)} title="Modifier" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(t)} title="Supprimer" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} total={tuteursFiltres.length} parPage={5} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeTuteurs;