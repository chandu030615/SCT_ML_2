#!/bin/bash
# Development script for Customer Segmentation Dashboard

echo "🔧 Starting Customer Segmentation Dashboard (Development Mode)"
echo "=============================================================="

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

# Set environment variables for development
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Run the application in development mode
echo "Starting Flask application in development mode..."
echo "Dashboard available at: http://localhost:5000"
echo "Auto-reload enabled for development"
echo "=============================================================="

python app.py
