from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        ENSEIGNANT = 'ENSEIGNANT', 'Enseignant'
        ELEVE = 'ELEVE', 'Eleve'

    role = models.CharField(max_length=15, choices=Role.choices, default=Role.ELEVE)

    def __str__(self):
        return f"{self.username} ({self.role})"


class DemandeReinitialisation(models.Model):
    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        TRAITEE = 'TRAITEE', 'Traitée'

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='demandes_reinitialisation')
    date_demande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=15, choices=Statut.choices, default=Statut.EN_ATTENTE)
    message = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Demande de {self.user.username} ({self.statut})"