from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    CustomTokenObtainPairView, RegisterView,
    PendingAccountsListView, ApproveAccountView, RejectAccountView,
    PasswordResetRequestCreateView, PasswordResetRequestListView, AdminResetPasswordView,
)
from scolaire.views import (
    EleveViewSet, ClasseViewSet, NoteViewSet, MatiereViewSet,
    EnseignantViewSet, InscriptionViewSet, AbsenceViewSet, TuteurViewSet,
    EleveTuteurViewSet, AffectationViewSet, EmploiDuTempsViewSet,
)

router = DefaultRouter()
router.register('eleves', EleveViewSet)
router.register('classes', ClasseViewSet)
router.register('notes', NoteViewSet)
router.register('matieres', MatiereViewSet)
router.register('enseignants', EnseignantViewSet)
router.register('inscriptions', InscriptionViewSet)
router.register('absences', AbsenceViewSet)
router.register('tuteurs', TuteurViewSet)
router.register('eleve-tuteurs', EleveTuteurViewSet)
router.register('affectations', AffectationViewSet)
router.register('emplois-du-temps', EmploiDuTempsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/comptes-en-attente/', PendingAccountsListView.as_view(), name='pending-accounts'),
    path('api/auth/comptes-en-attente/<int:pk>/valider/', ApproveAccountView.as_view(), name='approve-account'),
    path('api/auth/comptes-en-attente/<int:pk>/rejeter/', RejectAccountView.as_view(), name='reject-account'),
    path('api/auth/mot-de-passe-oublie/', PasswordResetRequestCreateView.as_view(), name='password-reset-request'),
    path('api/auth/demandes-reinitialisation/', PasswordResetRequestListView.as_view(), name='password-reset-list'),
    path('api/auth/demandes-reinitialisation/<int:pk>/traiter/', AdminResetPasswordView.as_view(), name='password-reset-process'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)