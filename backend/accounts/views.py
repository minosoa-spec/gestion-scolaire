from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from .models import CustomUser, DemandeReinitialisation
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    PendingAccountSerializer,
    PasswordResetRequestSerializer,
    PasswordResetRequestAdminSerializer,
    AdminSetPasswordSerializer,
)


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == CustomUser.Role.ADMIN


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class PendingAccountsListView(ListAPIView):
    serializer_class = PendingAccountSerializer
    permission_classes = [IsAdmin]
    queryset = CustomUser.objects.filter(is_active=False).order_by('-date_joined')


class ApproveAccountView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk, is_active=False)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'Compte introuvable ou déjà traité.'}, status=status.HTTP_404_NOT_FOUND)
        user.is_active = True
        user.save()
        return Response({'detail': 'Compte validé.'})


class RejectAccountView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk, is_active=False)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'Compte introuvable ou déjà traité.'}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({'detail': 'Compte rejeté et supprimé.'})


class PasswordResetRequestCreateView(CreateAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Votre demande a bien été enregistrée.'},
            status=status.HTTP_201_CREATED,
        )


class PasswordResetRequestListView(ListAPIView):
    serializer_class = PasswordResetRequestAdminSerializer
    permission_classes = [IsAdmin]
    queryset = DemandeReinitialisation.objects.filter(
        statut=DemandeReinitialisation.Statut.EN_ATTENTE
    ).order_by('-date_demande')


class AdminResetPasswordView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            demande = DemandeReinitialisation.objects.get(
                pk=pk, statut=DemandeReinitialisation.Statut.EN_ATTENTE
            )
        except DemandeReinitialisation.DoesNotExist:
            return Response({'detail': 'Demande introuvable ou déjà traitée.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminSetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        demande.user.set_password(serializer.validated_data['new_password'])
        demande.user.save()
        demande.statut = DemandeReinitialisation.Statut.TRAITEE
        demande.save()
        return Response({'detail': 'Mot de passe réinitialisé.'})