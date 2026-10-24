from django.db import models


class Classe(models.Model):
    nom_classe = models.CharField(max_length=50)
    niveau = models.CharField(max_length=30)
    annee_scolaire = models.CharField(max_length=9)
    effectif_max = models.IntegerField(default=40)

    def __str__(self):
        return f"{self.nom_classe} ({self.annee_scolaire})"


class Enseignant(models.Model):
    user = models.OneToOneField(
        'accounts.CustomUser', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='enseignant_profile'
    )
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    specialite = models.CharField(max_length=50, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=True)
    date_embauche = models.DateField(blank=True, null=True)
    photo = models.ImageField(upload_to='enseignants/', blank=True, null=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Matiere(models.Model):
    nom_matiere = models.CharField(max_length=50)
    coefficient = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)

    def __str__(self):
        return self.nom_matiere


class Eleve(models.Model):
    SEXE_CHOICES = [('M', 'Masculin'), ('F', 'Féminin')]

    user = models.OneToOneField(
        'accounts.CustomUser', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='eleve_profile'
    )
    matricule = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    date_naissance = models.DateField(blank=True, null=True)
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)
    adresse = models.CharField(max_length=150, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_inscription = models.DateField(auto_now_add=True)
    photo = models.ImageField(upload_to='eleves/', blank=True, null=True)

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"


class Tuteur(models.Model):
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.CharField(max_length=150, blank=True, null=True)
    profession = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class EleveTuteur(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE)
    tuteur = models.ForeignKey(Tuteur, on_delete=models.CASCADE)
    lien_parente = models.CharField(max_length=30)

    class Meta:
        unique_together = ('eleve', 'tuteur')


class Inscription(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE)
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE)
    annee_scolaire = models.CharField(max_length=9)
    date_inscription = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('eleve', 'annee_scolaire')


class Affectation(models.Model):
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE)
    annee_scolaire = models.CharField(max_length=9)


class Note(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE)
    valeur = models.DecimalField(max_digits=4, decimal_places=2)
    trimestre = models.PositiveSmallIntegerField()
    type_evaluation = models.CharField(max_length=30, default='devoir')
    date_evaluation = models.DateField()

    def __str__(self):
        return f"{self.eleve} - {self.matiere} : {self.valeur}"


class Absence(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE)
    date_absence = models.DateField()
    justifiee = models.BooleanField(default=False)
    motif = models.CharField(max_length=150, blank=True, null=True)


class EmploiDuTemps(models.Model):
    JOURS = [
        ('Lundi', 'Lundi'), ('Mardi', 'Mardi'), ('Mercredi', 'Mercredi'),
        ('Jeudi', 'Jeudi'), ('Vendredi', 'Vendredi'), ('Samedi', 'Samedi'),
    ]
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE)
    jour_semaine = models.CharField(max_length=10, choices=JOURS)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    salle = models.CharField(max_length=20, blank=True, null=True)