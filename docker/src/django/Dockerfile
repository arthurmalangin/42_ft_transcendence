FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd

COPY ../main /app/main
COPY ./docker/src/django/requirements.txt /app/requirements.txt
COPY ./docker/src/django/wait.sh /app/wait.sh 

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

WORKDIR /app/main

RUN chmod +x /app/wait.sh

ENTRYPOINT ["/app/wait.sh", "python", "manage.py", "runserver", "0.0.0.0:8000"]
