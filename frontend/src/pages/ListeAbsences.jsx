import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { CalendarX, Filter, RotateCcw, Plus, Pencil, Trash2, X, CheckCircle2, XCircle } from 'lucide-react';

const EMPTY_FORM = { eleve: '', date_absence: '', justifiee: false, motif: '' };

function ListeAbsences() {
  const [absences, setAbsences] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [filtreEleve, setFiltreEleve] = useState('');
  const [filtreJustifiee, setFiltreJustifiee] = useState('');
  const { user } = useAuth();
  const peutModifier = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ENSEIGNANT';
  const toast = useToast();
  const confirm = useConfirm();

  const charger = () => {
    setLoading(true);
    Promise.all([api.get('absences/'), api.get('eleves/')])
      .then(([aRes, eRes]) => { setAbsences(aRes.data); setEleves(eRes.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les absences'); setLoading(false); });
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`absences/${editingId}/`, form);
        toast.success('Absence modifiée avec succès.');
      } else {
        await api.post('absences/', form);
        toast.success('Absence ajoutée avec succès.');
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
    setForm({ eleve: a.eleve || '', date_absence: a.date_absence || '', justifiee: a.justifiee || false, motif: a.motif || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (a) => {
    const ok = await confirm({
      title: "Supprimer l'absence",
      message: `Voulez-vous vraiment supprimer cette absence de ${nomEleve(a.eleve)} du ${a.date_absence} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`absences/${a.id}/`);
      toast.success('Absence supprimée.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const nomEleve = (id) => { const e = eleves.find((x) => x.id === id); return e ? `${e.nom} ${e.prenom}` : id; };

  const absencesFiltrees = absences.filter((a) => {
    if (filtreEleve && a.eleve !== parseInt(filtreEleve)) return false;
    if (filtreJustifiee === 'oui' && !a.justifiee) return false;
    if (filtreJustifiee === 'non' && a.justifiee) return false;
    return true;
  });

  const { page, setPage, totalPages, itemsPage, resetPage } = usePagination(absencesFiltrees, 10);

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarX size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des absences</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Enregistrez et suivez les absences des élèves.</p>

      {peutModifier && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier une absence' : 'Ajouter une absence'}
          </h3>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-line' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Élève</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="eleve" value={form.eleve} onChange={handleChange} required>
                <option value="">-- Élève --</option>
                {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Date</label>
              <input style={{ ...inputStyle, marginTop: 5 }} type="date" name="date_absence" value={form.date_absence} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
              <input type="checkbox" name="justifiee" id="justifiee" checked={form.justifiee} onChange={handleChange} style={{ width: 18, height: 18, accentColor: '#6366f1', cursor: 'pointer' }} />
              <label htmlFor="justifiee" style={{ fontSize: 14, color: '#334155', fontWeight: 500, cursor: 'pointer' }}>Absence justifiée</label>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Motif</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="motif" placeholder="Motif (optionnel)" value={form.motif} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : "Ajouter l'absence"}
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
          <select style={{ ...inputStyle, width: 'auto', minWidth: 160 }} value={filtreJustifiee} onChange={(e) => { setFiltreJustifiee(e.target.value); resetPage(); }}>
            <option value="">-- Toutes --</option>
            <option value="oui">Justifiées</option>
            <option value="non">Non justifiées</option>
          </select>
          {(filtreEleve || filtreJustifiee) && (
            <button
              type="button"
              onClick={() => { setFiltreEleve(''); setFiltreJustifiee(''); resetPage(); }}
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
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>{absencesFiltrees.length} absence(s)</p>
          {absencesFiltrees.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune absence trouvée.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Élève</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Statut</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Motif</th>
                      {peutModifier && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 500, color: '#1e293b' }}>{nomEleve(a.eleve)}</td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{a.date_absence}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: a.justifiee ? '#ecfdf5' : '#fef2f2', color: a.justifiee ? '#059669' : '#dc2626' }}>
                            {a.justifiee ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {a.justifiee ? 'Justifiée' : 'Non justifiée'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{a.motif || '—'}</td>
                        {peutModifier && (
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
              <Pagination page={page} totalPages={totalPages} onChange={setPage} total={absencesFiltrees.length} parPage={5} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeAbsences;