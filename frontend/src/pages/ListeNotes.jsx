import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { ClipboardList, Filter, RotateCcw, Plus, Pencil, Trash2, X, Calendar } from 'lucide-react';

const EMPTY_FORM = { eleve: '', matiere: '', enseignant: '', valeur: '', trimestre: 1, type_evaluation: 'devoir', date_evaluation: '' };

function ListeNotes() {
  const [notes, setNotes] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [filtreEleve, setFiltreEleve] = useState('');
  const [filtreMatiere, setFiltreMatiere] = useState('');
  const [filtreTrimestre, setFiltreTrimestre] = useState('');
  const { user } = useAuth();
  const peutModifier = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ENSEIGNANT';
  const toast = useToast();
  const confirm = useConfirm();

  const charger = () => {
    setLoading(true);
    Promise.all([api.get('notes/'), api.get('eleves/'), api.get('matieres/'), api.get('enseignants/')])
      .then(([nRes, eRes, mRes, ensRes]) => {
        setNotes(nRes.data);
        setEleves(eRes.data);
        setMatieres(mRes.data);
        setEnseignants(ensRes.data);
        setLoading(false);
      })
      .catch(() => { setError('Impossible de charger les données'); setLoading(false); });
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`notes/${editingId}/`, form);
        toast.success('Note modifiée avec succès.');
      } else {
        await api.post('notes/', form);
        toast.success('Note ajoutée avec succès.');
      }
      resetForm();
      charger();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (n) => {
    setEditingId(n.id);
    setForm({
      eleve: n.eleve || '', matiere: n.matiere || '', enseignant: n.enseignant || '',
      valeur: n.valeur || '', trimestre: n.trimestre || 1,
      type_evaluation: n.type_evaluation || 'devoir', date_evaluation: n.date_evaluation || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (n) => {
    const ok = await confirm({
      title: 'Supprimer la note',
      message: `Voulez-vous vraiment supprimer cette note de ${nomEleve(n.eleve)} en ${nomMatiere(n.matiere)} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`notes/${n.id}/`);
      toast.success('Note supprimée.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const nomEleve = (id) => { const e = eleves.find((x) => x.id === id); return e ? `${e.nom} ${e.prenom}` : id; };
  const nomMatiere = (id) => { const m = matieres.find((x) => x.id === id); return m ? m.nom_matiere : id; };
  const nomEnseignant = (id) => { const e = enseignants.find((x) => x.id === id); return e ? `${e.prenom} ${e.nom}` : id; };

  const notesFiltrees = notes.filter((n) => {
    if (filtreEleve && n.eleve !== parseInt(filtreEleve)) return false;
    if (filtreMatiere && n.matiere !== parseInt(filtreMatiere)) return false;
    if (filtreTrimestre && n.trimestre !== parseInt(filtreTrimestre)) return false;
    return true;
  });

  const { page, setPage, totalPages, itemsPage, resetPage } = usePagination(notesFiltrees, 10);

  const couleurNote = (valeur) => {
    const v = parseFloat(valeur);
    if (v >= 14) return { bg: '#ecfdf5', text: '#059669' };
    if (v >= 10) return { bg: '#fffbeb', text: '#d97706' };
    return { bg: '#fef2f2', text: '#dc2626' };
  };

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des notes</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Enregistrez et consultez les notes des élèves.</p>

      {peutModifier && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier une note' : 'Ajouter une note'}
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
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Matière</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="matiere" value={form.matiere} onChange={handleChange} required>
                <option value="">-- Matière --</option>
                {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom_matiere}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Enseignant</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="enseignant" value={form.enseignant} onChange={handleChange} required>
                <option value="">-- Enseignant --</option>
                {enseignants.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Note /20</label>
              <input style={{ ...inputStyle, marginTop: 5 }} type="number" step="0.01" min="0" max="20" name="valeur" value={form.valeur} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Trimestre</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="trimestre" value={form.trimestre} onChange={handleChange}>
                <option value={1}>Trimestre 1</option>
                <option value={2}>Trimestre 2</option>
                <option value={3}>Trimestre 3</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Type</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="type_evaluation" placeholder="devoir, composition..." value={form.type_evaluation} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Date</label>
              <input style={{ ...inputStyle, marginTop: 5 }} type="date" name="date_evaluation" value={form.date_evaluation} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : 'Ajouter la note'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={15} /> Annuler
              </button>
            )}
          </div>
        </form>
      )}

      <div style={{ ...card, marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#334155', fontSize: 13, fontWeight: 600 }}>
          <Filter size={15} /> Filtres
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select style={{ ...inputStyle, width: 'auto', minWidth: 160 }} value={filtreEleve} onChange={(e) => { setFiltreEleve(e.target.value); resetPage(); }}>
            <option value="">-- Tous les élèves --</option>
            {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </select>
          <select style={{ ...inputStyle, width: 'auto', minWidth: 160 }} value={filtreMatiere} onChange={(e) => { setFiltreMatiere(e.target.value); resetPage(); }}>
            <option value="">-- Toutes les matières --</option>
            {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom_matiere}</option>)}
          </select>
          <select style={{ ...inputStyle, width: 'auto', minWidth: 160 }} value={filtreTrimestre} onChange={(e) => { setFiltreTrimestre(e.target.value); resetPage(); }}>
            <option value="">-- Tous les trimestres --</option>
            <option value={1}>Trimestre 1</option>
            <option value={2}>Trimestre 2</option>
            <option value={3}>Trimestre 3</option>
          </select>
          {(filtreEleve || filtreMatiere || filtreTrimestre) && (
            <button
              type="button"
              onClick={() => { setFiltreEleve(''); setFiltreMatiere(''); setFiltreTrimestre(''); resetPage(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <RotateCcw size={13} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>{notesFiltrees.length} note(s)</p>
          {notesFiltrees.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune note trouvée.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Élève</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Matière</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Enseignant</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Note</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Trim.</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                      {peutModifier && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((n) => {
                      const c = couleurNote(n.valeur);
                      return (
                        <tr key={n.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 500, color: '#1e293b' }}>{nomEleve(n.eleve)}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{nomMatiere(n.matiere)}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{nomEnseignant(n.enseignant)}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: c.bg, color: c.text }}>
                              {n.valeur}/20
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{n.trimestre}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{n.type_evaluation}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={13} />
                              {n.date_evaluation}
                            </div>
                          </td>
                          {peutModifier && (
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              <button onClick={() => handleEdit(n)} title="Modifier" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleDelete(n)} title="Supprimer" style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} total={notesFiltrees.length} parPage={5} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeNotes;