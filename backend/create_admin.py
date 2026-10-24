import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get('ADMIN_USER')
password = os.environ.get('ADMIN_PASSWORD')

if not username or not password:
    print("ADMIN_USER ou ADMIN_PASSWORD non défini(e) — création du compte admin ignorée.")
else:
    if User.objects.filter(username=username).exists():
        print(f"Le compte '{username}' existe déjà, rien à faire.")
    else:
        user = User.objects.create_superuser(username=username, password=password)
        if hasattr(user, 'role'):
            user.role = 'ADMIN'
            user.save()
        print(f"Compte admin '{username}' créé avec succès.")
