import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  School,
  GraduationCap,
  BookOpen,
  TrendingUp,
  PieChart,
  AlertTriangle,
  CalendarX,
  CalendarClock,
  UserX,
} from 'lucide-react';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [emploiDuTemps, setEmploiDuTemps] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('eleves/'),
      api.get('classes/'),
      api.get('enseignants/'),
      api.get('matieres/'),
      api.get('absences/'),
      api.get('inscriptions/'),
      api.get('emplois-du-temps/'),
    ])
      .then(([eRes, cRes, ensRes, mRes, aRes, iRes, edtRes]) => {
        setEleves(eRes.data);
        setClasses(cRes.data);
        setEnseignants(ensRes.data);
        setMatieres(mRes.data);
        setAbsences(aRes.data);
        setInscriptions(iRes.data);
        setEmploiDuTemps(edtRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger le tableau de bord');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Chargement...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;

  const nbGarcons = eleves.filter((e) => e.sexe === 'M').length;
  const nbFilles = eleves.filter((e) => e.sexe === 'F').length;
  const totalSexe = nbGarcons + nbFilles;
  const pctGarcons = totalSexe > 0 ? (nbGarcons / totalSexe) * 100 : 0;
  const pctFilles = totalSexe > 0 ? (nbFilles / totalSexe) * 100 : 0;

  const rayon = 60;
  const circonference = 2 * Math.PI * rayon;
  const segmentGarcons = (pctGarcons / 100) * circonference;
  const segmentFilles = (pctFilles / 100) * circonference;

  const maintenant = new Date();
  const moisRecents = [];
  for (let i = 8; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    moisRecents.push({ annee: d.getFullYear(), mois: d.getMonth(), label: MOIS_LABELS[d.getMonth()] });
  }
  const evolutionData = moisRecents.map((m) => {
    const count = eleves.filter((e) => {
      if (!e.date_inscription) return false;
      const d = new Date(e.date_inscription);
      return d.getFullYear() === m.annee && d.getMonth() === m.mois;
    }).length;
    return { label: m.label, count };
  });

  let cumul = eleves.filter((e) => {
    if (!e.date_inscription) return true;
    const d = new Date(e.date_inscription);
    return d < new Date(moisRecents[0].annee, moisRecents[0].mois, 1);
  }).length;
  const evolutionCumulee = evolutionData.map((e) => {
    cumul += e.count;
    return { label: e.label, total: cumul };
  });
  const maxCumul = Math.max(1, ...evolutionCumulee.map((e) => e.total));

  const nomClasseActuelle = (eleveId) => {
    const insc = [...inscriptions]
      .filter((i) => i.eleve === eleveId)
      .sort((a, b) => new Date(b.date_inscription) - new Date(a.date_inscription))[0];
    if (!insc) return '—';
    const c = classes.find((x) => x.id === insc.classe);
    return c ? c.nom_classe : '—';
  };
  const dernieresInscriptions = [...eleves]
    .sort((a, b) => new Date(b.date_inscription) - new Date(a.date_inscription))
    .slice(0, 5);

  const unSemaineAgo = new Date();
  unSemaineAgo.setDate(unSemaineAgo.getDate() - 7);
  const absencesNonJustifieesRecentes = absences.filter(
    (a) => !a.justifiee && new Date(a.date_absence) >= unSemaineAgo
  ).length;

  const idsElevesInscrits = new Set(inscriptions.map((i) => i.eleve));
  const elevesSansInscription = eleves.filter((e) => !idsElevesInscrits.has(e.id)).length;

  const idsClassesAvecCreneaux = new Set(emploiDuTemps.map((c) => c.classe));
  const classesSansEmploi = classes.filter((c) => !idsClassesAvecCreneaux.has(c.id)).length;

  const alertes = [
    absencesNonJustifieesRecentes > 0 && {
      icon: CalendarX,
      color: '#dc2626',
      bg: '#fef2f2',
      titre: `${absencesNonJustifieesRecentes} absence(s) non justifiée(s)`,
      detail: 'Sur les 7 derniers jours',
    },
    elevesSansInscription > 0 && {
      icon: UserX,
      color: '#f59e0b',
      bg: '#fffbeb',
      titre: `${elevesSansInscription} élève(s) sans inscription`,
      detail: "Aucune classe assignée pour l'année en cours",
    },
    classesSansEmploi > 0 && {
      icon: CalendarClock,
      color: '#2563eb',
      bg: '#eff6ff',
      titre: `${classesSansEmploi} classe(s) sans emploi du temps`,
      detail: 'Aucun créneau planifié',
    },
  ].filter(Boolean);

  const card = {
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    padding: 22,
  };

  const statCards = [
    { valeur: eleves.length, label: 'Élèves', icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { valeur: enseignants.length, label: 'Enseignants', icon: GraduationCap, color: '#7c3aed', bg: '#f5f3ff' },
    { valeur: classes.length, label: 'Classes', icon: School, color: '#059669', bg: '#ecfdf5' },
    { valeur: matieres.length, label: 'Matières', icon: BookOpen, color: '#d97706', bg: '#fffbeb' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '32px auto', fontFamily: 'sans-serif', padding: '0 24px' }}>
      <style>{`
        .dash-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .dash-card:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(0,0,0,0.1); }
        .insc-row { transition: background 0.12s ease; }
        .insc-row:hover { background: #f8fafc; }
      `}</style>

      <div
        style={{
          background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          borderRadius: 16,
          padding: '26px 30px',
          color: '#fff',
          marginBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            Bonjour, {user?.username} 👋
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            Voici un aperçu de votre établissement.
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="dash-card" style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: s.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} color={s.color} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{s.valeur}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 22 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <TrendingUp size={17} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: 15 }}>Évolution des effectifs</h3>
          </div>
          <svg viewBox="0 0 620 180" style={{ width: '100%', height: 180 }}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="30" x2="610" y1={20 + i * 40} y2={20 + i * 40} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={evolutionCumulee
                .map((e, i) => {
                  const x = 30 + (i * (580 / (evolutionCumulee.length - 1)));
                  const y = 150 - (e.total / maxCumul) * 130;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            {evolutionCumulee.map((e, i) => {
              const x = 30 + (i * (580 / (evolutionCumulee.length - 1)));
              const y = 150 - (e.total / maxCumul) * 130;
              return <circle key={i} cx={x} cy={y} r="3.5" fill="#2563eb" />;
            })}
            {evolutionCumulee.map((e, i) => {
              const x = 30 + (i * (580 / (evolutionCumulee.length - 1)));
              return (
                <text key={i} x={x} y="170" fontSize="10" fill="#94a3b8" textAnchor="middle">
                  {e.label}
                </text>
              );
            })}
          </svg>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <PieChart size={17} color="#7c3aed" />
            <h3 style={{ margin: 0, fontSize: 15 }}>Répartition par sexe</h3>
          </div>
          {totalSexe === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucun élève enregistré.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <svg viewBox="0 0 160 160" style={{ width: 140, height: 140, flexShrink: 0 }}>
                <circle cx="80" cy="80" r={rayon} fill="none" stroke="#f1f5f9" strokeWidth="20" />
                <circle
                  cx="80"
                  cy="80"
                  r={rayon}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray={`${segmentGarcons} ${circonference}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={rayon}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="20"
                  strokeDasharray={`${segmentFilles} ${circonference}`}
                  strokeDashoffset={-segmentGarcons}
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />
                <text x="80" y="76" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1e293b">
                  {totalSexe}
                </text>
                <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#94a3b8">
                  élèves
                </text>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
                  <div style={{ fontSize: 13, color: '#334155' }}>
                    Garçons <strong>{nbGarcons}</strong> ({pctGarcons.toFixed(0)}%)
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ec4899' }} />
                  <div style={{ fontSize: 13, color: '#334155' }}>
                    Filles <strong>{nbFilles}</strong> ({pctFilles.toFixed(0)}%)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Dernières inscriptions</h3>
          {dernieresInscriptions.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucun élève enregistré.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Élève</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Classe</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Matricule</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dernieresInscriptions.map((e) => (
                    <tr key={e.id} className="insc-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '9px 6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {e.photo ? (
                            <img
                              src={e.photo}
                              alt=""
                              style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {e.prenom?.charAt(0)}{e.nom?.charAt(0)}
                            </div>
                          )}
                          <span style={{ fontWeight: 500, color: '#1e293b' }}>{e.prenom} {e.nom}</span>
                        </div>
                      </td>
                      <td style={{ padding: '9px 6px', color: '#64748b' }}>{nomClasseActuelle(e.id)}</td>
                      <td style={{ padding: '9px 6px', color: '#64748b' }}>{e.matricule}</td>
                      <td style={{ padding: '9px 6px', color: '#64748b' }}>{e.date_inscription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={17} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: 15 }}>Alertes</h3>
          </div>
          {alertes.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucune alerte pour le moment.</p>
          ) : (
            alertes.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 0',
                    borderBottom: i < alertes.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: a.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={a.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{a.titre}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.detail}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;