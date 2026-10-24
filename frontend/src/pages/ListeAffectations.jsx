import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { ListChecks, Plus, Pencil, Trash2, X, ArrowRight } from 'lucide-react';

const EMPTY_FORM = { enseignant: '', matiere: '', classe: '', annee_scolaire: '' };

function ListeAffectations() {
  const [affectations, setAffectations] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
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

  const { page, setPage, totalPages, itemsPage } = usePagination(affectations, 10);

  const charger = () => {
    setLoading(true);
    Promise.all([api.get('affectations/'), api.get('enseignants/'), api.get('matieres/'), api.get('classes/')])
      .then(([aRes, ensRes, mRes, cRes]) => {
        setAffectations(aRes.data); setEnseignants(ensRes.data); setMatieres(mRes.data); setClasses(cRes.data);
        setLoading(false);
      })
      .catch(() => { setError('Impossible de charger les affectations'); setLoading(false); });
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`affectations/${editingId}/`, form);
        toast.success('Affectation modifiée avec succès.');
      } else {
        await api.post('affectations/', form);
        toast.success('Affectation ajoutée avec succès.');
      }
      resetForm();
      charger();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.id);
    setForm({ enseignant: a.enseignant || '', matiere: a.matiere || '', classe: a.classe || '', annee_scolaire: a.annee_scolaire || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (a) => {
    const ok = await confirm({
      title: "Supprimer l'affectation",
      message: `Voulez-vous vraiment supprimer l'affectation de ${nomEnseignant(a.enseignant)} en ${nomMatiere(a.matiere)} pour ${nomClasse(a.classe)} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`affectations/${a.id}/`);
      toast.success('Affectation supprimée.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const nomEnseignant = (id) => { const e = enseignants.find((x) => x.id === id); return e ? `${e.prenom} ${e.nom}` : id; };
  const nomMatiere = (id) => { const m = matieres.find((x) => x.id === id); return m ? m.nom_matiere : id; };
  const nomClasse = (id) => { const c = classes.find((x) => x.id === id); return c ? c.nom_classe : id; };

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ maxWidth: 950, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ListChecks size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des affectations</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Attribuez un enseignant à une matière et une classe.</p>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier une affectation' : 'Ajouter une affectation'}
          </h3>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-line' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Enseignant</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="enseignant" value={form.enseignant} onChange={handleChange} required>
                <option value="">-- Enseignant --</option>
                {enseignants.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Matière</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="matiere" value={form.matiere} onChange={handleChange} required>
                <option value="">-- Matière --</option>
                {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom_matiere}</option>)}
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
              {editingId ? 'Enregistrer les modifications' : "Ajouter l'affectation"}
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
          {affectations.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune affectation trouvée.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Affectation</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Année scolaire</th>
                      {isAdmin && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{nomEnseignant(a.enseignant)}</span>
                            <ArrowRight size={13} color="#94a3b8" />
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#3b82f6' }}>
                              {nomMatiere(a.matiere)}
                            </span>
                            <ArrowRight size={13} color="#94a3b8" />
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                              {nomClasse(a.classe)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{a.annee_scolaire}</td>
                        {isAdmin && (
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <button onClick={() => handleEdit(a)} title="Modifier" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(a)} title="Supprimer" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} total={affectations.length} parPage={5} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeAffectations;