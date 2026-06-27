from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token


class OptionalTokenAuthentication(TokenAuthentication):
    """Authenticate when a valid token is present; otherwise treat as anonymous."""

    keyword = 'Token'

    def authenticate(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth.startswith(f'{self.keyword} '):
            return None
        parts = auth.split()
        if len(parts) != 2:
            return None
        try:
            token = Token.objects.select_related('user').get(key=parts[1])
        except Token.DoesNotExist:
            return None
        if not token.user.is_active:
            return None
        return (token.user, token)
