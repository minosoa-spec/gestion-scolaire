#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Crée (ou met à jour) le compte administrateur si les variables existent
if [ -n "$ADMIN_PASSWORD" ]; then
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
U = get_user_model()
u, created = U.objects.get_or_create(username=os.environ.get('ADMIN_USER', 'admin'))
if created:
    u.set_password(os.environ['ADMIN_PASSWORD'])
u.role = 'ADMIN'
u.is_staff = True
u.is_superuser = True
u.save()
"
fi