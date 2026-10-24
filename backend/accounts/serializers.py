from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from .models import CustomUser, DemandeReinitialisation


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed(
                "Identifiants incorrects, ou compte en attente de validation par un administrateur."
            )
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['user_id'] = self.user.id
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'role']

    def validate_role(self, value):
        if value == CustomUser.Role.ADMIN:
            raise serializers.ValidationError("Ce rôle ne peut pas être choisi lors de l'inscription.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', CustomUser.Role.ELEVE),
        )
        user.is_active = False
        user.save()
        return user


class PendingAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'date_joined']


class PasswordResetRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    message = serializers.CharField(required=False, allow_blank=True, max_length=255)

    def validate_username(self, value):
        if not CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Aucun compte ne correspond à ce nom d'utilisateur.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.get(username=validated_data['username'])
        return DemandeReinitialisation.objects.create(
            user=user, message=validated_data.get('message', '')
        )


class PasswordResetRequestAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = DemandeReinitialisation
        fields = ['id', 'username', 'role', 'date_demande', 'statut', 'message']


class AdminSetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=6)