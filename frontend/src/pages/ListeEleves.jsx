import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { parseApiError } from '../utils/errorParser';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  UserRound,
  Camera,
} from 'lucide-react';

const EMPTY_FORM = {
  matricule: '', nom: '', prenom: '', date_naissance: '', sexe: 'M', adresse: '', telephone: '',
};

const PAR_PAGE = 5;

function ListeEleves() {
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const toast = useToast();
  const confirm = useConfirm();

  const chargerEleves = () => {
    setLoading(true);
    api.get('eleves/')
      .then((res) => { setEleves(res.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les élèves'); setLoading(false); });
  };

  useEffect(() => { chargerEleves(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value ?? '');
      });
      if (photoFile) data.append('photo', photoFile);

      if (editingId) {
        await api.put(`eleves/${editingId}/`, data);
        toast.success('Élève modifié avec succès.');
      } else {
        await api.post('eleves/', data);
        toast.success('Élève ajouté avec succès.');
      }
      resetForm();
      chargerEleves();
    } catch (err) {
      const message = parseApiError(err);
      setFormError(message);
      toast.error(message);
    }
  };

  const handleEdit = (eleve) => {
    setEditingId(eleve.id);
    setForm({
      matricule: eleve.matricule || '', nom: eleve.nom || '', prenom: eleve.prenom || '',
      date_naissance: eleve.date_naissance || '', sexe: eleve.sexe || 'M',
      adresse: eleve.adresse || '', telephone: eleve.telephone || '',
    });
    setPhotoFile(null);
    setPhotoPreview(eleve.photo || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (eleve) => {
    const ok = await confirm({
      title: "Supprimer l'élève",
      message: `Voulez-vous vraiment supprimer ${eleve.prenom} ${eleve.nom} ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.delete(`eleves/${eleve.id}/`);
      toast.success('Élève supprimé.');
      chargerEleves();
    } catch (err) {
      toast.error(parseApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const termeRecherche = recherche.trim().toLowerCase();
  const elevesFiltres = eleves.filter((e) => {
    if (!termeRecherche) return true;
    return (
      e.matricule?.toLowerCase().includes(termeRecherche) ||
      e.nom?.toLowerCase().includes(termeRecherche) ||
      e.prenom?.toLowerCase().includes(termeRecherche)
    );
  });

  const { page, setPage, totalPages, itemsPage, resetPage } = usePagination(elevesFiltres, PAR_PAGE);

  // Revenir à la page 1 quand la recherche change
  useEffect(() => { resetPage(); }, [recherche]); // eslint-disable-line react-hooks/exhaustive-deps

  const card = {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    padding: 24,
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <style>{`
        .input-styled:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .btn-primary {
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }
        .btn-icon {
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .btn-icon:hover {
          transform: scale(1.06);
        }
        .row-eleve {
          transition: background 0.12s ease;
        }
        .row-eleve:hover {
          background: #f8fafc;
        }
        .photo-upload-label {
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .photo-upload-label:hover {
          border-color: #6366f1 !important;
          background: #eef2ff !important;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Users size={22} color="#3b82f6" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Gestion des élèves</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>
        Consultez, ajoutez et gérez les élèves de l'établissement.
      </p>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ ...card, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingId ? <Pencil size={18} color="#6366f1" /> : <Plus size={18} color="#6366f1" />}
            {editingId ? 'Modifier un élève' : 'Ajouter un élève'}
          </h3>

          {formError && (
            <div
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: 13,
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 16,
                whiteSpace: 'pre-line',
              }}
            >
              {formError}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserRound size={30} color="#94a3b8" />
              )}
            </div>
            <label
              htmlFor="photo-input-eleve"
              className="photo-upload-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                border: '1px dashed #cbd5e1',
                borderRadius: 8,
                fontSize: 13,
                color: '#475569',
                cursor: 'pointer',
                background: '#f8fafc',
              }}
            >
              <Camera size={15} />
              {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
            </label>
            <input
              id="photo-input-eleve"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Matricule</label>
              <input className="input-styled" style={{ ...inputStyle, marginTop: 5 }} name="matricule" placeholder="ex : E2026-014" value={form.matricule} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Nom</label>
              <input className="input-styled" style={{ ...inputStyle, marginTop: 5 }} name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Prénom</label>
              <input className="input-styled" style={{ ...inputStyle, marginTop: 5 }} name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Date de naissance</label>
              <input className="input-styled" style={{ ...inputStyle, marginTop: 5 }} type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Sexe</label>
              <select className="input-styled" style={{ ...inputStyle, marginTop: 5 }} name="sexe" value={form.sexe} onChange={handleChange}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Téléphone</label>
              <input className="input-styled" style={{ ...inputStyle, marginTop: 5 }} name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>Adresse</label>
              <input className="input-styled" style={{ ...inputStyle, marginTop: 5 }} name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? 'Enregistrer les modifications' : "Ajouter l'élève"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 18px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <X size={15} />
                Annuler
              </button>
            )}
          </div>
        </form>
      )}

      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input-styled"
          type="text"
          placeholder="Rechercher par nom, prénom ou matricule..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={card}>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
            {elevesFiltres.length} élève(s) {termeRecherche && `trouvé(s) pour "${recherche}"`}
          </p>

          {elevesFiltres.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun élève trouvé.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Élève</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Matricule</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Sexe</th>
                      {isAdmin && <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPage.map((e) => (
                      <tr key={e.id} className="row-eleve" style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {e.photo ? (
                              <img
                                src={e.photo}
                                alt=""
                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: e.sexe === 'F' ? '#fce7f3' : '#dbeafe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <UserRound size={16} color={e.sexe === 'F' ? '#db2777' : '#2563eb'} />
                              </div>
                            )}
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{e.prenom} {e.nom}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{e.matricule}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '3px 10px',
                              borderRadius: 999,
                              background: e.sexe === 'F' ? '#fce7f3' : '#dbeafe',
                              color: e.sexe === 'F' ? '#db2777' : '#2563eb',
                            }}
                          >
                            {e.sexe === 'F' ? 'Féminin' : 'Masculin'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleEdit(e)}
                              className="btn-icon"
                              title="Modifier"
                              style={{
                                width: 30, height: 30, borderRadius: 7, border: 'none',
                                background: '#eef2ff', color: '#6366f1', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6,
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(e)}
                              className="btn-icon"
                              title="Supprimer"
                              style={{
                                width: 30, height: 30, borderRadius: 7, border: 'none',
                                background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                total={elevesFiltres.length}
                parPage={PAR_PAGE}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListeEleves;