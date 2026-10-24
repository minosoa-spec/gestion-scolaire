import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { UserPlus, Plus, Pencil, Trash2, X, ArrowRight } from 'lucide-react';

const EMPTY_FORM = { eleve: '', classe: '', annee_scolaire: '' };

function ListeInscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const toast = useToast();
  const confirm = useConfirm();

  const { page, setPage, totalPages, itemsPage } = usePagination(inscriptions, 10);

  const charger = () => {
    setLoading(true);
    Promise.all([api.get('inscriptions/'), api.get('eleves/'), api.get('classes/')])
      .then(([iRes, eRes, cRes]) => { setInscriptions(iRes.data); setEleves(eRes.data); setClasses(cRes.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les inscriptions'); setLoading(false); });
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`inscriptions/${editingId}/`, form);
        toast.success('Inscription modifiée avec succès.');
      } else {
        await api.post('inscriptions/', form);
        toast.success('Inscription ajoutée avec succès.');
      }
      resetForm();
      charger();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (i) => {
    setEditingId(i.id);
    setForm({ eleve: i.eleve || '', classe: i.classe || '', annee_scolaire: i.annee_scolaire || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (i) => {
    const ok = await confirm({
      title: "Supprimer l'inscription",
      message: `Voulez-vous vraiment supprimer l'inscription de ${nomEleve(i.eleve)} en ${nomClasse(i.classe)} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`inscriptions/${i.id}/`);
      toast.success('Inscription supprimée.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const nomEleve = (id) => { const e = eleves.find((x) => x.id === id); return e ? `${e.nom} ${e.prenom}` : id; };
  const nomClasse = (id) => { const c = classes.find((x) => x.id === id); return c ? c.nom_classe : id; };

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserPlus size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des inscriptions</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Inscrivez les élèves dans une classe pour une année scolaire donnée.</p>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier une inscription' : 'Ajouter une inscription'}
          </h3>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-line' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Élève</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="eleve" value={form.eleve} onChange={handleChange} required>
                <option value="">-- Élève --</option>
                {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Classe</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="classe" value={form.classe} onChange={handleChange} required>
                <option value="">-- Classe --</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.nom_classe}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Année scolaire</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="annee_scolaire" placeholder="ex : 2025-2026" value={form.annee_scolaire} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : "Ajouter l'inscription"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={15} /> Annuler
              </button>
            )}
          </div>
        </form>
      )}

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          {inscriptions.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune inscription trouvée.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Inscription</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Année scolaire</th>
                      {isAdmin && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((i) => (
                      <tr key={i.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{nomEleve(i.eleve)}</span>
                            <ArrowRight size={14} color="#94a3b8" />
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#3b82f6' }}>
                              {nomClasse(i.classe)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{i.annee_scolaire}</td>
                        {isAdmin && (
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <button onClick={() => handleEdit(i)} title="Modifier" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(i)} title="Supprimer" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} total={inscriptions.length} parPage={5} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeInscriptions;