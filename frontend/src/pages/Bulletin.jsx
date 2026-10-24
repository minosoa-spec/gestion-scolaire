import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { parseApiError } from '../utils/errorParser';
import { FileText, User, Printer, Award } from 'lucide-react';

function Bulletin() {
  const { user } = useAuth();
  const isEleve = user?.role?.toUpperCase() === 'ELEVE';
  const toast = useToast();

  const [eleves, setEleves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [notes, setNotes] = useState([]);

  const [eleveSelectionne, setEleveSelectionne] = useState('');
  const [trimestre, setTrimestre] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('eleves/'), api.get('matieres/'), api.get('notes/')])
      .then(([elRes, matRes, noteRes]) => {
        setEleves(elRes.data);
        setMatieres(matRes.data);
        setNotes(noteRes.data);

        if (isEleve) {
          const monEleve = elRes.data.find((e) => e.user === user.id);
          if (monEleve) setEleveSelectionne(monEleve.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        const message = parseApiError(err, 'Impossible de charger les données');
        setError(message);
        toast.error(message);
        setLoading(false);
      });
  }, [isEleve, user]);

  const nomMatiere = (id) => { const m = matieres.find((x) => x.id === id); return m ? m.nom_matiere : '—'; };
  const coefMatiere = (id) => { const m = matieres.find((x) => x.id === id); return m ? parseFloat(m.coefficient) : 1; };

  const notesFiltrees = notes.filter(
    (n) => n.eleve === parseInt(eleveSelectionne) && n.trimestre === parseInt(trimestre)
  );

  const parMatiere = {};
  notesFiltrees.forEach((n) => {
    if (!parMatiere[n.matiere]) parMatiere[n.matiere] = [];
    parMatiere[n.matiere].push(parseFloat(n.valeur));
  });

  const lignesBulletin = Object.entries(parMatiere).map(([matiereId, valeurs]) => {
    const id = parseInt(matiereId);
    const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    const coef = coefMatiere(id);
    return { matiere: nomMatiere(id), moyenne, coefficient: coef, points: moyenne * coef, nbNotes: valeurs.length };
  });

  const totalCoef = lignesBulletin.reduce((a, l) => a + l.coefficient, 0);
  const totalPoints = lignesBulletin.reduce((a, l) => a + l.points, 0);
  const moyenneGenerale = totalCoef > 0 ? totalPoints / totalCoef : null;

  const eleveInfo = eleves.find((e) => e.id === parseInt(eleveSelectionne));

  const couleurMoyenne = (v) => {
    if (v === null) return { bg: '#f1f5f9', text: '#64748b' };
    if (v >= 14) return { bg: '#ecfdf5', text: '#059669' };
    if (v >= 10) return { bg: '#fffbeb', text: '#d97706' };
    return { bg: '#fef2f2', text: '#dc2626' };
  };

  const appreciation = (v) => {
    if (v === null) return '';
    if (v >= 16) return 'Excellent';
    if (v >= 14) return 'Très bien';
    if (v >= 12) return 'Bien';
    if (v >= 10) return 'Assez bien';
    return 'Insuffisant';
  };

  const couleurGen = couleurMoyenne(moyenneGenerale);

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', padding: 24 };
  const inputStyle = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div style={{ maxWidth: 850, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={22} color="#10b981" strokeWidth={2.2} />
        </div>
        <h2 style={{ margin: 0 }}>Bulletin de notes</h2>
      </div>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 24, marginLeft: 54 }}>Consultez la moyenne par matière et la moyenne générale d'un trimestre.</p>

      {loading && <p style={{ color: '#64748b' }}>Chargement...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="no-print" style={{ ...card, marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {!isEleve && (
              <div>
                <label style={{ fontSize: 12, color: '#334155', fontWeight: 600, display: 'block', marginBottom: 5 }}>Élève</label>
                <select style={{ ...inputStyle, minWidth: 220 }} value={eleveSelectionne} onChange={(e) => setEleveSelectionne(e.target.value)}>
                  <option value="">-- Choisir un élève --</option>
                  {eleves.map((e) => (
                    <option key={e.id} value={e.id}>{e.nom} {e.prenom} ({e.matricule})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: '#334155', fontWeight: 600, display: 'block', marginBottom: 5 }}>Trimestre</label>
              <select style={inputStyle} value={trimestre} onChange={(e) => setTrimestre(e.target.value)}>
                <option value={1}>Trimestre 1</option>
                <option value={2}>Trimestre 2</option>
                <option value={3}>Trimestre 3</option>
              </select>
            </div>
            {eleveSelectionne && lignesBulletin.length > 0 && (
              <button
                onClick={() => window.print()}
                style={{ marginLeft: 'auto', padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Printer size={15} /> Imprimer
              </button>
            )}
          </div>

          {!eleveSelectionne && (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 0' }}>Sélectionne un élève pour afficher son bulletin.</p>
          )}

          {eleveSelectionne && (
            <div style={card}>
              {eleveInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{eleveInfo.nom} {eleveInfo.prenom}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Matricule {eleveInfo.matricule} — Trimestre {trimestre}</div>
                  </div>
                </div>
              )}

              {lignesBulletin.length === 0 && (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune note enregistrée pour ce trimestre.</p>
              )}

              {lignesBulletin.length > 0 && (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                          <th style={{ textAlign: 'left', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Matière</th>
                          <th style={{ textAlign: 'center', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Nb notes</th>
                          <th style={{ textAlign: 'center', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Moyenne</th>
                          <th style={{ textAlign: 'center', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Coef.</th>
                          <th style={{ textAlign: 'right', padding: '10px 8px', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lignesBulletin.map((l, i) => {
                          const c = couleurMoyenne(l.moyenne);
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                              <td style={{ padding: '10px 8px', fontWeight: 500, color: '#1e293b' }}>{l.matiere}</td>
                              <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{l.nbNotes}</td>
                              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: c.bg, color: c.text }}>
                                  {l.moyenne.toFixed(2)}
                                </span>
                              </td>
                              <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{l.coefficient}</td>
                              <td style={{ padding: '10px 8px', textAlign: 'right', color: '#64748b' }}>{l.points.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 20, padding: '18px 20px', borderRadius: 10, background: couleurGen.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Award size={22} color={couleurGen.text} />
                      <div>
                        <div style={{ fontSize: 12, color: couleurGen.text, fontWeight: 600, textTransform: 'uppercase' }}>Moyenne générale</div>
                        <div style={{ fontSize: 13, color: couleurGen.text }}>{appreciation(moyenneGenerale)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: couleurGen.text }}>
                      {moyenneGenerale !== null ? moyenneGenerale.toFixed(2) : '—'}
                      <span style={{ fontSize: 16, fontWeight: 600 }}> / 20</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Bulletin;