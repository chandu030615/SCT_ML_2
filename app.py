
"""
Flask API Backend for Customer Segmentation Dashboard
====================================================

This Flask application provides REST API endpoints for the customer segmentation
dashboard frontend. It integrates with the segmentation tools to provide
real-time analysis capabilities.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import io
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

class CustomerSegmentationAPI:
    def __init__(self):
        self.data = None
        self.scaled_features = None
        self.kmeans_model = None
        self.cluster_labels = None
        self.scaler = StandardScaler()

    def preprocess_data(self, data, include_gender=True):
        """Preprocess data for clustering"""
        # Create RFM features
        data['Recency'] = 2.5 - (data['Spending_Score'] / 100) * 2 + np.random.exponential(0.3, len(data))
        data['Frequency'] = np.round(1 + (data['Spending_Score'] / 100) * 14).astype(int)
        data['Monetary'] = (data['Annual_Income'] * data['Spending_Score'] / 100)

        if include_gender and 'Gender' in data.columns:
            data['Gender_Numeric'] = data['Gender'].map({'Male': 0, 'Female': 1})
            features = ['Age', 'Annual_Income', 'Spending_Score', 'Recency', 'Frequency', 'Monetary', 'Gender_Numeric']
        else:
            features = ['Age', 'Annual_Income', 'Spending_Score', 'Recency', 'Frequency', 'Monetary']

        clustering_data = data[features].copy()
        scaled_features = self.scaler.fit_transform(clustering_data)

        return clustering_data, scaled_features, features

    def find_optimal_k(self, scaled_features, k_range=range(2, 11)):
        """Find optimal number of clusters"""
        wcss = []
        silhouette_scores = []

        for k in k_range:
            kmeans = KMeans(n_clusters=k, init='k-means++', max_iter=300, n_init=10, random_state=42)
            kmeans.fit(scaled_features)
            wcss.append(kmeans.inertia_)

            silhouette_avg = silhouette_score(scaled_features, kmeans.labels_)
            silhouette_scores.append(silhouette_avg)

        # Find best k based on silhouette score
        best_idx = silhouette_scores.index(max(silhouette_scores))
        optimal_k = list(k_range)[best_idx]

        return optimal_k, wcss, silhouette_scores

    def perform_clustering(self, data, k=None, include_gender=True):
        """Perform complete clustering analysis"""
        clustering_data, scaled_features, features = self.preprocess_data(data, include_gender)

        if k is None:
            optimal_k, wcss, silhouette_scores = self.find_optimal_k(scaled_features)
        else:
            optimal_k = k
            wcss, silhouette_scores = [], []

        # Apply K-means
        kmeans = KMeans(n_clusters=optimal_k, init='k-means++', max_iter=300, n_init=10, random_state=42)
        cluster_labels = kmeans.fit_predict(scaled_features)

        # Add cluster labels to data
        result_data = data.copy()
        result_data['Cluster'] = cluster_labels

        # Calculate silhouette score
        silhouette_avg = silhouette_score(scaled_features, cluster_labels)

        # Create cluster summary
        cluster_summary = self.analyze_clusters(result_data)

        return {
            'data': result_data,
            'cluster_summary': cluster_summary,
            'optimal_k': optimal_k,
            'silhouette_score': silhouette_avg,
            'cluster_labels': cluster_labels.tolist(),
            'features_used': features
        }

    def analyze_clusters(self, data):
        """Analyze clusters and provide business interpretation"""
        cluster_summary = data.groupby('Cluster').agg({
            'Age': 'mean',
            'Annual_Income': 'mean',
            'Spending_Score': 'mean',
            'CustomerID': 'count'
        }).round(2)

        cluster_summary['Customer_Count'] = cluster_summary['CustomerID']
        cluster_summary['Percentage'] = (cluster_summary['Customer_Count'] / len(data) * 100).round(1)
        del cluster_summary['CustomerID']

        # Add business interpretation
        segments = []
        for i in cluster_summary.index:
            cluster_data = cluster_summary.loc[i]

            avg_income = cluster_data['Annual_Income']
            avg_spending = cluster_data['Spending_Score']
            avg_age = cluster_data['Age']

            # Business interpretation logic
            if avg_spending >= 80 and avg_income >= 70000:
                name = "Premium High-Spenders"
                strategy = "VIP programs, luxury experiences, premium services"
            elif avg_spending >= 70:
                name = "High-Value Customers"
                strategy = "Loyalty programs, cross-selling, retention"
            elif avg_spending <= 25 and avg_income <= 40000:
                name = "Budget-Conscious Shoppers"
                strategy = "Discounts, value propositions, sales events"
            elif avg_income >= 70000 and avg_spending <= 40:
                name = "Conservative High-Earners"
                strategy = "Quality brands, investment pieces, premium services"
            elif avg_age >= 50:
                name = "Senior Customers"
                strategy = "Comfort amenities, traditional brands, accessibility"
            elif avg_age <= 30:
                name = "Young Customers"
                strategy = "Trendy brands, social experiences, digital integration"
            else:
                name = "Standard Customers"
                strategy = "General retail, seasonal promotions, mainstream brands"

            segments.append({
                'cluster': i,
                'name': name,
                'strategy': strategy,
                'size': int(cluster_data['Customer_Count']),
                'percentage': float(cluster_data['Percentage']),
                'avg_age': float(cluster_data['Age']),
                'avg_income': float(cluster_data['Annual_Income']),
                'avg_spending': float(cluster_data['Spending_Score'])
            })

        return segments

# Initialize the segmentation API
segmentation_api = CustomerSegmentationAPI()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Handle CSV file upload and return data preview"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read CSV data
        df = pd.read_csv(file)

        # Validate required columns
        required_cols = ['Age', 'Annual_Income', 'Spending_Score']
        missing_cols = [col for col in required_cols if col not in df.columns]

        if missing_cols:
            return jsonify({'error': f'Missing required columns: {missing_cols}'}), 400

        # Return data preview
        preview_data = df.head(10).to_dict('records')

        return jsonify({
            'success': True,
            'data': preview_data,
            'shape': df.shape,
            'columns': df.columns.tolist(),
            'data_types': df.dtypes.to_dict()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sample-data', methods=['GET'])
def get_sample_data():
    """Return sample Mall Customers data"""
    try:
        # Create sample data
        np.random.seed(42)
        sample_df = pd.DataFrame({
            'CustomerID': range(1, 51),
            'Gender': np.random.choice(['Male', 'Female'], 50),
            'Age': np.random.randint(18, 80, 50),
            'Annual_Income': np.random.randint(15000, 140000, 50),
            'Spending_Score': np.random.randint(1, 101, 50)
        })

        preview_data = sample_df.to_dict('records')

        return jsonify({
            'success': True,
            'data': preview_data,
            'shape': sample_df.shape,
            'columns': sample_df.columns.tolist(),
            'is_sample': True
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_customers():
    """Perform customer segmentation analysis"""
    try:
        data = request.json

        # Convert data to DataFrame
        df = pd.DataFrame(data['customers'])

        # Get analysis parameters
        k = data.get('clusters', None)
        include_gender = data.get('include_gender', True)

        # Perform clustering
        results = segmentation_api.perform_clustering(df, k, include_gender)

        return jsonify({
            'success': True,
            'results': {
                'optimal_k': results['optimal_k'],
                'silhouette_score': round(results['silhouette_score'], 3),
                'cluster_summary': results['cluster_summary'],
                'total_customers': len(df),
                'features_used': results['features_used']
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/csv', methods=['POST'])
def export_csv():
    """Export segmentation results as CSV"""
    try:
        data = request.json
        df = pd.DataFrame(data['customers'])

        # Create CSV in memory
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        # Create file response
        return jsonify({
            'success': True,
            'csv_data': output.getvalue(),
            'filename': f'customer_segmentation_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualizations', methods=['POST'])
def get_visualizations():
    """Generate visualization data for charts"""
    try:
        data = request.json
        df = pd.DataFrame(data['customers'])

        # Generate chart data
        visualizations = {
            'scatter_data': {
                'x': df['Annual_Income'].tolist(),
                'y': df['Spending_Score'].tolist(),
                'colors': df.get('Cluster', [0]*len(df)).tolist(),
                'labels': df.get('Cluster_Name', ['Cluster 0']*len(df)).tolist()
            },
            'cluster_sizes': df.groupby('Cluster').size().to_dict() if 'Cluster' in df.columns else {},
            'age_distribution': df.groupby('Cluster')['Age'].mean().to_dict() if 'Cluster' in df.columns else {},
            'gender_distribution': df.groupby(['Cluster', 'Gender']).size().unstack(fill_value=0).to_dict() if 'Gender' in df.columns and 'Cluster' in df.columns else {}
        }

        return jsonify({
            'success': True,
            'visualizations': visualizations
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
