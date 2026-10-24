import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { School, Search, Plus, Pencil, Trash2, X } from 'lucide-react';

const EMPTY_FORM = { nom_classe: '', niveau: '', annee_scolaire: '', effectif_max: 40 };

function ListeClasses() {
  const [classes, setClasses] = useState([]);
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
    api.get('classes/')
      .then((res) => { setClasses(res.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les classes'); setLoading(false); });
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`classes/${editingId}/`, form);
        toast.success('Classe modifiée avec succès.');
      } else {
        await api.post('classes/', form);
        toast.success('Classe ajoutée avec succès.');
      }
      resetForm();
      charger();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (classe) => {
    setEditingId(classe.id);
    setForm({
      nom_classe: classe.nom_classe || '', niveau: classe.niveau || '',
      annee_scolaire: classe.annee_scolaire || '', effectif_max: classe.effectif_max || 40,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (classe) => {
    const ok = await confirm({
      title: 'Supprimer la classe',
      message: `Voulez-vous vraiment supprimer ${classe.nom_classe} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`classes/${classe.id}/`);
      toast.success('Classe supprimée.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const termeRecherche = recherche.trim().toLowerCase();
  const classesFiltrees = classes.filter((c) => {
    if (!termeRecherche) return true;
    return (
      c.nom_classe?.toLowerCase().includes(termeRecherche) ||
      c.niveau?.toLowerCase().includes(termeRecherche) ||
      c.annee_scolaire?.toLowerCase().includes(termeRecherche)
    );
  });

  const { page, setPage, totalPages, itemsPage, resetPage } = usePagination(classesFiltrees, 10);

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <School size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des classes</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Consultez et gérez les classes de l'établissement.</p>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier une classe' : 'Ajouter une classe'}
          </h3>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-line' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Nom de la classe</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="nom_classe" placeholder="ex : 6ème A" value={form.nom_classe} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Niveau</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="niveau" placeholder="ex : 6ème" value={form.niveau} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Année scolaire</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="annee_scolaire" placeholder="ex : 2025-2026" value={form.annee_scolaire} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Effectif max</label>
              <input style={{ ...inputStyle, marginTop: 5 }} type="number" name="effectif_max" value={form.effectif_max} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : 'Ajouter la classe'}
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
        <input type="text" placeholder="Rechercher par nom, niveau ou année..." value={recherche} onChange={(e) => { setRecherche(e.target.value); resetPage(); }} style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
            {classesFiltrees.length} classe(s) {termeRecherche && `trouvée(s) pour "${recherche}"`}
          </p>
          {classesFiltrees.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune classe trouvée.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Nom</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Niveau</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Année</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Effectif max</th>
                      {isAdmin && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 500, color: '#1e293b' }}>{c.nom_classe}</td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{c.niveau}</td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{c.annee_scolaire}</td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{c.effectif_max}</td>
                        {isAdmin && (
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <button onClick={() => handleEdit(c)} title="Modifier" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(c)} title="Supprimer" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} total={classesFiltrees.length} parPage={5} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeClasses;