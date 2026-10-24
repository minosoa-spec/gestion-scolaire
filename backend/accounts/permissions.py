from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class IsEnseignant(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ENSEIGNANT')


class IsEleve(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ELEVE')


class IsAdminOrEnseignant(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'ENSEIGNANT')
        )


class IsAdminOrEnseignantOrReadOnlyEleve(BasePermission):
    """Admin/Enseignant : tout. Eleve : lecture seule uniquement."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ('ADMIN', 'ENSEIGNANT'):
            return True
        return request.method in SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """Admin : tout. Enseignant/Eleve : lecture seule uniquement."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == 'ADMIN':
            return True
        return request.method in SAFE_METHODS