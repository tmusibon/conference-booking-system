FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y postgresql-client && pip install -r requirements.txt
COPY . .
RUN chmod +x wait-for-it.sh
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]