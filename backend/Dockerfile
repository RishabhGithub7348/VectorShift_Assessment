# Builder stage
FROM python:3.9-slim AS builder
WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y --no-install-recommends gcc libc-dev libpq-dev \
    && pip install --no-cache-dir --user -r requirements.txt \
    && apt-get purge -y --auto-remove gcc libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Final stage
FROM python:3.9-slim
WORKDIR /app

# Install libpq5 for runtime
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /root/.local
COPY . .

# Set environment variables
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Ensure all files are executable where needed
RUN chmod -R 755 /app

# Expose port
EXPOSE 8000

# Run the application with python main.py
CMD python main.py --host 0.0.0.0 --port $PORT
