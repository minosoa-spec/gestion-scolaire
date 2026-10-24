from rest_framework import viewsets
from accounts.permissions import IsAdminOrEnseignantOrReadOnlyEleve, IsAdminOrReadOnly
from .models import (
    Eleve, Classe, Matiere, Enseignant, Note, Absence, Inscription,
    Tuteur, EleveTuteur, Affectation, EmploiDuTemps,
)
from .serializers import (
    EleveSerializer, ClasseSerializer, MatiereSerializer,
    EnseignantSerializer, NoteSerializer, AbsenceSerializer, InscriptionSerializer,
    TuteurSerializer, EleveTuteurSerializer, AffectationSerializer, EmploiDuTempsSerializer,
)


class ClasseViewSet(viewsets.ModelViewSet):
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [IsAdminOrReadOnly]


class EnseignantViewSet(viewsets.ModelViewSet):
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer
    permission_classes = [IsAdminOrReadOnly]


class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [IsAdminOrReadOnly]


class EleveViewSet(viewsets.ModelViewSet):
    queryset = Eleve.objects.all()
    serializer_class = EleveSerializer
    permission_classes = [IsAdminOrReadOnly]


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAdminOrEnseignantOrReadOnlyEleve]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ELEVE':
            return Note.objects.filter(eleve__user=user)
        return Note.objects.all()


class AbsenceViewSet(viewsets.ModelViewSet):
    queryset = Absence.objects.all()
    serializer_class = AbsenceSerializer
    permission_classes = [IsAdminOrEnseignantOrReadOnlyEleve]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ELEVE':
            return Absence.objects.filter(eleve__user=user)
        return Absence.objects.all()


class InscriptionViewSet(viewsets.ModelViewSet):
    queryset = Inscription.objects.all()
    serializer_class = InscriptionSerializer
    permission_classes = [IsAdminOrReadOnly]


class TuteurViewSet(viewsets.ModelViewSet):
    queryset = Tuteur.objects.all()
    serializer_class = TuteurSerializer
    permission_classes = [IsAdminOrReadOnly]


class EleveTuteurViewSet(viewsets.ModelViewSet):
    queryset = EleveTuteur.objects.all()
    serializer_class = EleveTuteurSerializer
    permission_classes = [IsAdminOrReadOnly]


class AffectationViewSet(viewsets.ModelViewSet):
    queryset = Affectation.objects.all()
    serializer_class = AffectationSerializer
    permission_classes = [IsAdminOrReadOnly]


class EmploiDuTempsViewSet(viewsets.ModelViewSet):
    queryset = EmploiDuTemps.objects.all()
    serializer_class = EmploiDuTempsSerializer
    permission_classes = [IsAdminOrReadOnly]