#!/bin/bash
# Production deployment script for Customer Segmentation Dashboard

echo "🚀 Starting Customer Segmentation Dashboard"
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install -r requirements_flask.txt

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=production

# Run the application
echo "Starting Flask application..."
echo "Dashboard available at: http://localhost:5000"
echo "API documentation available at: http://localhost:5000/api/health"
echo "=========================================="

# Start with gunicorn for production
gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app
