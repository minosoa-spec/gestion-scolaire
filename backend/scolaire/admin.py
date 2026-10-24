from django.contrib import admin
from .models import (
    Classe, Enseignant, Matiere, Eleve, Tuteur,
    EleveTuteur, Inscription, Affectation, Note, Absence, EmploiDuTemps
)

admin.site.register(Classe)
admin.site.register(Enseignant)
admin.site.register(Matiere)
admin.site.register(Eleve)
admin.site.register(Tuteur)
admin.site.register(EleveTuteur)
admin.site.register(Inscription)
admin.site.register(Affectation)
admin.site.register(Note)
admin.site.register(Absence)
admin.site.register(EmploiDuTemps)