# Customer Segmentation Dashboard Deployment Guide

## Deployment Options

### 1. Local Development
```bash
# Install dependencies
pip install -r requirements_flask.txt

# Run Flask backend
python app.py

# Open frontend at http://localhost:5000
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t customer-segmentation-dashboard .

# Run container
docker run -p 5000:5000 customer-segmentation-dashboard
```

### 3. Cloud Deployment (Heroku)
```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy to Heroku
heroku create customer-segmentation-app
git push heroku main
```

### 4. Cloud Deployment (AWS/GCP)
- Use the Dockerfile for container deployment
- Set up load balancer for production
- Configure SSL certificates
- Set up monitoring and logging

## Environment Variables
- FLASK_ENV: production/development
- PORT: Application port (default: 5000)
- DEBUG: Enable/disable debug mode

## API Endpoints
- GET /api/health - Health check
- POST /api/upload - Upload CSV data
- GET /api/sample-data - Get sample data
- POST /api/analyze - Perform segmentation
- POST /api/export/csv - Export results
- POST /api/visualizations - Get chart data

## Frontend Features
- Drag & drop file upload
- Interactive data preview
- Real-time clustering analysis
- Multiple visualization types
- Business insights generation
- Export functionality
