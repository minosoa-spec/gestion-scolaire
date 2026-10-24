const LABELS = {
  matricule: 'Matricule', nom: 'Nom', prenom: 'Prénom', date_naissance: 'Date de naissance',
  sexe: 'Sexe', adresse: 'Adresse', telephone: 'Téléphone', email: 'Email', photo: 'Photo',
  nom_matiere: 'Nom de la matière', coefficient: 'Coefficient',
  nom_classe: 'Nom de la classe', niveau: 'Niveau', annee_scolaire: 'Année scolaire', effectif_max: 'Effectif max',
  specialite: 'Spécialité', date_embauche: "Date d'embauche",
  eleve: 'Élève', matiere: 'Matière', enseignant: 'Enseignant', classe: 'Classe',
  valeur: 'Valeur', trimestre: 'Trimestre', type_evaluation: "Type d'évaluation", date_evaluation: 'Date',
  date_absence: 'Date', justifiee: 'Justifiée', motif: 'Motif',
  tuteur: 'Tuteur', lien_parente: 'Lien de parenté',
  jour_semaine: 'Jour', heure_debut: 'Heure de début', heure_fin: 'Heure de fin', salle: 'Salle',
  username: "Nom d'utilisateur", password: 'Mot de passe',
  non_field_errors: '',
};

function labelPour(champ) {
  if (LABELS[champ] !== undefined) return LABELS[champ];
  return champ.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function parseApiError(err, messageParDefaut = "Une erreur est survenue lors de l'enregistrement.") {
  const data = err?.response?.data;
  if (!data) return messageParDefaut;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join(' ');

  if (typeof data === 'object') {
    const lignes = Object.entries(data).map(([champ, messages]) => {
      const texte = Array.isArray(messages) ? messages.join(' ') : String(messages);
      const label = labelPour(champ);
      return label ? `${label} : ${texte}` : texte;
    });
    if (lignes.length > 0) return lignes.join('\n');
  }

  return messageParDefaut;
}