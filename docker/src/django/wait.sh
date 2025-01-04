#!/bin/bash

while ! nc -z db 5432; do
	echo "Waiting for PostgreSQL to be ready..."
	sleep 0.5
done
echo "PostgreSQL is up and running - executing command"

python manage.py makemigrations login
python manage.py makemigrations settings
python manage.py migrate

exec "$@"