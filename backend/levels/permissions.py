from rest_framework.permissions import BasePermission


class IsLevelAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.has_perm('accounts.manage_platform')))
