# Customer Segmentation Dashboard Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements_flask.txt .
RUN pip install --no-cache-dir -r requirements_flask.txt

# Copy application files
COPY app.py .
COPY customer_segmentation_tool.py .
COPY mall_customer_segmentation_tool.py .

# Copy frontend files
COPY index.html .
COPY style.css .
COPY app.js .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
