FROM python:3.11-slim

WORKDIR /app

COPY ../main /app/main
COPY ./docker/src/django/requirements.txt /app/requirements.txt

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

WORKDIR /app/main

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
