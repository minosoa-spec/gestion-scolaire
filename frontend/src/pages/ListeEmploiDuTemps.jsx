import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { CalendarClock, Filter, RotateCcw, Plus, Pencil, Trash2, X, Clock, MapPin } from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const EMPTY_FORM = { classe: '', matiere: '', enseignant: '', jour_semaine: 'Lundi', heure_debut: '', heure_fin: '', salle: '' };

function ListeEmploiDuTemps() {
  const [creneaux, setCreneaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [filtreClasse, setFiltreClasse] = useState('');
  const [filtreJour, setFiltreJour] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const toast = useToast();
  const confirm = useConfirm();

  const charger = () => {
    setLoading(true);
    Promise.all([api.get('emplois-du-temps/'), api.get('classes/'), api.get('matieres/'), api.get('enseignants/')])
      .then(([edtRes, classRes, matRes, ensRes]) => {
        setCreneaux(edtRes.data); setClasses(classRes.data); setMatieres(matRes.data); setEnseignants(ensRes.data);
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
        await api.put(`emplois-du-temps/${editingId}/`, form);
        toast.success('Créneau modifié avec succès.');
      } else {
        await api.post('emplois-du-temps/', form);
        toast.success('Créneau ajouté avec succès.');
      }
      resetForm();
      charger();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      classe: c.classe || '', matiere: c.matiere || '', enseignant: c.enseignant || '',
      jour_semaine: c.jour_semaine || 'Lundi', heure_debut: c.heure_debut || '', heure_fin: c.heure_fin || '', salle: c.salle || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (c) => {
    const ok = await confirm({
      title: 'Supprimer le créneau',
      message: `Voulez-vous vraiment supprimer ce créneau (${c.jour_semaine}, ${c.heure_debut}-${c.heure_fin}) ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`emplois-du-temps/${c.id}/`);
      toast.success('Créneau supprimé.');
      charger();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const nomClasse = (id) => { const c = classes.find((x) => x.id === id); return c ? `${c.nom_classe} (${c.annee_scolaire})` : id; };
  const nomMatiere = (id) => { const m = matieres.find((x) => x.id === id); return m ? m.nom_matiere : id; };
  const nomEnseignant = (id) => { const e = enseignants.find((x) => x.id === id); return e ? `${e.prenom} ${e.nom}` : id; };

  const creneauxFiltres = creneaux.filter((c) => {
    if (filtreClasse && c.classe !== parseInt(filtreClasse)) return false;
    if (filtreJour && c.jour_semaine !== filtreJour) return false;
    return true;
  });

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarClock size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Emploi du temps</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Planifiez les créneaux de cours par classe et par jour.</p>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier un créneau' : 'Ajouter un créneau'}
          </h3>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-line' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Classe</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="classe" value={form.classe} onChange={handleChange} required>
                <option value="">-- Classe --</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.nom_classe} ({c.annee_scolaire})</option>)}
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
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Jour</label>
              <select style={{ ...inputStyle, marginTop: 5 }} name="jour_semaine" value={form.jour_semaine} onChange={handleChange}>
                {JOURS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Heure de début</label>
              <input style={{ ...inputStyle, marginTop: 5 }} type="time" name="heure_debut" value={form.heure_debut} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Heure de fin</label>
              <input style={{ ...inputStyle, marginTop: 5 }} type="time" name="heure_fin" value={form.heure_fin} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Salle</label>
              <input style={{ ...inputStyle, marginTop: 5 }} name="salle" placeholder="Salle (optionnel)" value={form.salle} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : 'Ajouter le créneau'}
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
          <select style={{ ...inputStyle, width: 'auto', minWidth: 180 }} value={filtreClasse} onChange={(e) => setFiltreClasse(e.target.value)}>
            <option value="">-- Toutes les classes --</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom_classe} ({c.annee_scolaire})</option>)}
          </select>
          <select style={{ ...inputStyle, width: 'auto', minWidth: 160 }} value={filtreJour} onChange={(e) => setFiltreJour(e.target.value)}>
            <option value="">-- Tous les jours --</option>
            {JOURS.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
          {(filtreClasse || filtreJour) && (
            <button
              type="button"
              onClick={() => { setFiltreClasse(''); setFiltreJour(''); }}
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
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>{creneauxFiltres.length} créneau(x)</p>
          {creneauxFiltres.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun créneau trouvé.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Jour</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Horaire</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Classe</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Matière</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Enseignant</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Salle</th>
                    {isAdmin && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {creneauxFiltres.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#eff6ff', color: '#3b82f6' }}>
                          {c.jour_semaine}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} />
                          {c.heure_debut} - {c.heure_fin}
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 500, color: '#1e293b' }}>{nomClasse(c.classe)}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{nomMatiere(c.matiere)}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>{nomEnseignant(c.enseignant)}</td>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>
                        {c.salle ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} />{c.salle}</div> : '—'}
                      </td>
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
          )}
        </div>
      )}
    </div>
  );
}

export default ListeEmploiDuTemps;