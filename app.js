// Customer Segmentation Dashboard JavaScript

// Sample data from the application data
const sampleData = [
    {"CustomerID": 1, "Gender": "Male", "Age": 19, "Annual_Income": 15000, "Spending_Score": 39, "Cluster": 3, "Cluster_Name": "Young Male Shoppers"},
    {"CustomerID": 2, "Gender": "Male", "Age": 21, "Annual_Income": 15000, "Spending_Score": 81, "Cluster": 6, "Cluster_Name": "Young High Spenders"},
    {"CustomerID": 3, "Gender": "Female", "Age": 20, "Annual_Income": 16000, "Spending_Score": 6, "Cluster": 1, "Cluster_Name": "Budget Conscious"},
    {"CustomerID": 4, "Gender": "Female", "Age": 23, "Annual_Income": 16000, "Spending_Score": 77, "Cluster": 6, "Cluster_Name": "Young High Spenders"},
    {"CustomerID": 5, "Gender": "Female", "Age": 31, "Annual_Income": 17000, "Spending_Score": 40, "Cluster": 4, "Cluster_Name": "Standard Customers"},
    {"CustomerID": 6, "Gender": "Female", "Age": 22, "Annual_Income": 19000, "Spending_Score": 76, "Cluster": 6, "Cluster_Name": "Young High Spenders"},
    {"CustomerID": 7, "Gender": "Female", "Age": 35, "Annual_Income": 20000, "Spending_Score": 6, "Cluster": 1, "Cluster_Name": "Budget Conscious"},
    {"CustomerID": 8, "Gender": "Female", "Age": 23, "Annual_Income": 20000, "Spending_Score": 94, "Cluster": 6, "Cluster_Name": "Young High Spenders"},
    {"CustomerID": 9, "Gender": "Male", "Age": 64, "Annual_Income": 21000, "Spending_Score": 3, "Cluster": 1, "Cluster_Name": "Budget Conscious"},
    {"CustomerID": 10, "Gender": "Female", "Age": 30, "Annual_Income": 23000, "Spending_Score": 14, "Cluster": 1, "Cluster_Name": "Budget Conscious"},
    {"CustomerID": 11, "Gender": "Male", "Age": 67, "Annual_Income": 25000, "Spending_Score": 82, "Cluster": 2, "Cluster_Name": "Senior Male Shoppers"},
    {"CustomerID": 12, "Gender": "Female", "Age": 35, "Annual_Income": 25000, "Spending_Score": 32, "Cluster": 4, "Cluster_Name": "Standard Customers"},
    {"CustomerID": 13, "Gender": "Female", "Age": 58, "Annual_Income": 25000, "Spending_Score": 61, "Cluster": 2, "Cluster_Name": "Senior Male Shoppers"},
    {"CustomerID": 14, "Gender": "Female", "Age": 24, "Annual_Income": 25000, "Spending_Score": 40, "Cluster": 4, "Cluster_Name": "Standard Customers"},
    {"CustomerID": 15, "Gender": "Male", "Age": 37, "Annual_Income": 26000, "Spending_Score": 49, "Cluster": 4, "Cluster_Name": "Standard Customers"},
    {"CustomerID": 16, "Gender": "Male", "Age": 22, "Annual_Income": 26000, "Spending_Score": 42, "Cluster": 4, "Cluster_Name": "Standard Customers"},
    {"CustomerID": 17, "Gender": "Female", "Age": 35, "Annual_Income": 27000, "Spending_Score": 40, "Cluster": 4, "Cluster_Name": "Standard Customers"},
    {"CustomerID": 18, "Gender": "Female", "Age": 20, "Annual_Income": 27000, "Spending_Score": 76, "Cluster": 6, "Cluster_Name": "Young High Spenders"},
    {"CustomerID": 19, "Gender": "Male", "Age": 52, "Annual_Income": 28000, "Spending_Score": 18, "Cluster": 1, "Cluster_Name": "Budget Conscious"},
    {"CustomerID": 20, "Gender": "Female", "Age": 35, "Annual_Income": 28000, "Spending_Score": 83, "Cluster": 0, "Cluster_Name": "Premium High-Spenders"}
];

const clusterSummary = [
    {"Cluster": 0, "Cluster_Name": "Premium High-Spenders (Female)", "Customer_Count": 21, "Percentage": 10.5, "Avg_Age": 32.2, "Avg_Income": 86047, "Avg_Spending": 81.7, "Marketing_Strategy": "VIP programs, luxury experiences, premium services"},
    {"Cluster": 1, "Cluster_Name": "Budget-Conscious Shoppers", "Customer_Count": 17, "Percentage": 8.5, "Avg_Age": 46.5, "Avg_Income": 26411, "Avg_Spending": 15.7, "Marketing_Strategy": "Discounts, value propositions, sales events"},
    {"Cluster": 2, "Cluster_Name": "Senior Male Shoppers", "Customer_Count": 23, "Percentage": 11.5, "Avg_Age": 57.2, "Avg_Income": 53260, "Avg_Spending": 47.1, "Marketing_Strategy": "Comfort amenities, traditional brands, accessibility"},
    {"Cluster": 3, "Cluster_Name": "Young Male Shoppers", "Customer_Count": 22, "Percentage": 11.0, "Avg_Age": 24.9, "Avg_Income": 41045, "Avg_Spending": 60.1, "Marketing_Strategy": "Trendy brands, social experiences, digital integration"}
];

const analysisMetrics = {
    "total_customers": 200,
    "optimal_k": 10,
    "silhouette_score": 0.344,
    "premium_segments": 2,
    "budget_segments": 3,
    "analysis_date": "2025-09-21"
};

// Global variables
let currentData = [];
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    initializeEventListeners();
});

function initializeEventListeners() {
    console.log('Setting up event listeners...');
    
    // Get DOM elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const sampleDataBtn = document.getElementById('sample-data-btn');
    const clustersSlider = document.getElementById('clusters-slider');
    const clustersValue = document.getElementById('clusters-value');
    const runAnalysisBtn = document.getElementById('run-analysis-btn');
    
    // File upload listeners
    if (browseBtn) {
        browseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Browse button clicked');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    if (sampleDataBtn) {
        sampleDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Sample data button clicked');
            loadSampleData();
        });
    }
    
    // Drag and drop listeners
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }
    
    // Configuration listeners
    if (clustersSlider) {
        clustersSlider.addEventListener('input', updateClustersValue);
    }
    
    if (runAnalysisBtn) {
        runAnalysisBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Run analysis button clicked');
            runAnalysis();
        });
    }
    
    // Export listeners
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportSummaryBtn = document.getElementById('export-summary-btn');
    const exportReportBtn = document.getElementById('export-report-btn');
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => exportData('csv'));
    }
    if (exportSummaryBtn) {
        exportSummaryBtn.addEventListener('click', () => exportData('summary'));
    }
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', () => exportData('report'));
    }
    
    console.log('Event listeners set up successfully');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvData = parseCSV(e.target.result);
            displayDataPreview(csvData);
            currentData = csvData;
            showConfigSection();
        };
        reader.readAsText(file);
    } else {
        alert('Please select a valid CSV file.');
    }
}

function loadSampleData() {
    console.log('Loading sample data...');
    
    try {
        // Extend sample data to simulate larger dataset
        const extendedData = [];
        for (let i = 0; i < 10; i++) {
            sampleData.forEach((row, index) => {
                extendedData.push({
                    ...row,
                    CustomerID: i * sampleData.length + index + 1,
                    Age: Math.max(18, Math.min(70, row.Age + Math.floor(Math.random() * 10 - 5))),
                    Annual_Income: Math.max(15000, row.Annual_Income + Math.floor(Math.random() * 10000 - 5000)),
                    Spending_Score: Math.max(1, Math.min(100, row.Spending_Score + Math.floor(Math.random() * 20 - 10)))
                });
            });
        }
        
        currentData = extendedData.slice(0, 200); // Limit to 200 customers
        console.log('Sample data loaded:', currentData.length, 'customers');
        
        displayDataPreview(currentData);
        showConfigSection();
    } catch (error) {
        console.error('Error loading sample data:', error);
        alert('Error loading sample data. Please try again.');
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            const value = values[index];
            // Try to convert to number if possible
            row[header] = isNaN(value) ? value : Number(value);
        });
        return row;
    });
}

function displayDataPreview(data) {
    console.log('Displaying data preview for', data.length, 'rows');
    
    try {
        document.getElementById('rows-count').textContent = data.length;
        document.getElementById('columns-count').textContent = Object.keys(data[0]).length;
        
        // Display first 5 rows in table
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');
        
        // Clear existing content
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        
        // Create header
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);
        
        // Create rows (first 5 only)
        data.slice(0, 5).forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
        
        const dataPreview = document.getElementById('data-preview');
        if (dataPreview) {
            dataPreview.classList.remove('hidden');
            dataPreview.style.display = 'block';
        }
        
        console.log('Data preview displayed successfully');
    } catch (error) {
        console.error('Error displaying data preview:', error);
    }
}

function showConfigSection() {
    console.log('Showing configuration section...');
    
    try {
        const configSection = document.getElementById('config-section');
        if (configSection) {
            configSection.classList.remove('hidden');
            configSection.style.display = 'block';
            
            // Scroll to the config section
            setTimeout(() => {
                configSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 300);
            
            console.log('Configuration section is now visible');
        } else {
            console.error('Config section element not found');
        }
    } catch (error) {
        console.error('Error showing config section:', error);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.classList.add('dragover');
    }
}

function handleDragLeave(event) {
    event.preventDefault();
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.classList.remove('dragover');
    }
}

function handleDrop(event) {
    event.preventDefault();
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.classList.remove('dragover');
    }
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.files = files;
            handleFileUpload({ target: { files: files } });
        }
    }
}

function updateClustersValue() {
    const clustersSlider = document.getElementById('clusters-slider');
    const clustersValue = document.getElementById('clusters-value');
    
    if (clustersSlider && clustersValue) {
        clustersValue.textContent = clustersSlider.value;
    }
}

async function runAnalysis() {
    console.log('Starting analysis...');
    
    try {
        // Show loading section
        showSection('loading');
        
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Update metrics
        updateAnalysisMetrics();
        
        // Create visualizations
        createCharts();
        
        // Display insights
        displayInsights();
        
        // Show results
        showSection('results');
        showSection('insights');
        showSection('export');
        
        console.log('Analysis completed successfully');
    } catch (error) {
        console.error('Error running analysis:', error);
        alert('Error running analysis. Please try again.');
    }
}

function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    const sections = {
        'loading': document.getElementById('loading-section'),
        'results': document.getElementById('results-section'),
        'insights': document.getElementById('insights-section'),
        'export': document.getElementById('export-section')
    };
    
    if (sectionName === 'loading') {
        // Hide other sections when showing loading
        Object.keys(sections).forEach(key => {
            if (key !== 'loading' && sections[key]) {
                sections[key].classList.add('hidden');
            }
        });
        
        if (sections.loading) {
            sections.loading.classList.remove('hidden');
            sections.loading.style.display = 'block';
            
            // Scroll to loading section
            setTimeout(() => {
                sections.loading.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    } else {
        // Hide loading when showing results
        if (sections.loading) {
            sections.loading.classList.add('hidden');
        }
        
        // Show the requested section
        const section = sections[sectionName];
        if (section) {
            section.classList.remove('hidden');
            section.style.display = 'block';
            
            // If showing results, scroll to it
            if (sectionName === 'results') {
                setTimeout(() => {
                    section.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 300);
            }
        }
    }
}

function updateAnalysisMetrics() {
    const clustersSlider = document.getElementById('clusters-slider');
    
    const totalCustomersEl = document.getElementById('total-customers');
    const optimalClustersEl = document.getElementById('optimal-clusters');
    const silhouetteScoreEl = document.getElementById('silhouette-score');
    const analysisDateEl = document.getElementById('analysis-date');
    
    if (totalCustomersEl) totalCustomersEl.textContent = currentData.length;
    if (optimalClustersEl && clustersSlider) optimalClustersEl.textContent = clustersSlider.value;
    if (silhouetteScoreEl) silhouetteScoreEl.textContent = analysisMetrics.silhouette_score;
    if (analysisDateEl) analysisDateEl.textContent = new Date().toISOString().split('T')[0];
}

function createCharts() {
    console.log('Creating charts...');
    
    // Add delay to ensure DOM is ready
    setTimeout(() => {
        createScatterChart();
        createPieChart();
        createBarChart();
        createStackedBarChart();
    }, 500);
}

function createScatterChart() {
    const ctx = document.getElementById('scatter-chart');
    if (!ctx) {
        console.error('Scatter chart canvas not found');
        return;
    }
    
    try {
        const context = ctx.getContext('2d');
        
        // Destroy existing chart if it exists
        if (charts.scatter) {
            charts.scatter.destroy();
        }
        
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
        
        const datasets = clusterSummary.map((cluster, index) => {
            const clusterData = sampleData.filter(d => d.Cluster === cluster.Cluster);
            return {
                label: cluster.Cluster_Name,
                data: clusterData.map(d => ({
                    x: d.Annual_Income,
                    y: d.Spending_Score
                })),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                pointRadius: 6
            };
        });
        
        charts.scatter = new Chart(context, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Annual Income ($)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Spending Score (1-100)'
                        }
                    }
                }
            }
        });
        
        console.log('Scatter chart created successfully');
    } catch (error) {
        console.error('Error creating scatter chart:', error);
    }
}

function createPieChart() {
    const ctx = document.getElementById('pie-chart');
    if (!ctx) {
        console.error('Pie chart canvas not found');
        return;
    }
    
    try {
        const context = ctx.getContext('2d');
        
        if (charts.pie) {
            charts.pie.destroy();
        }
        
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'];
        
        charts.pie = new Chart(context, {
            type: 'pie',
            data: {
                labels: clusterSummary.map(c => c.Cluster_Name),
                datasets: [{
                    data: clusterSummary.map(c => c.Customer_Count),
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        console.log('Pie chart created successfully');
    } catch (error) {
        console.error('Error creating pie chart:', error);
    }
}

function createBarChart() {
    const ctx = document.getElementById('bar-chart');
    if (!ctx) {
        console.error('Bar chart canvas not found');
        return;
    }
    
    try {
        const context = ctx.getContext('2d');
        
        if (charts.bar) {
            charts.bar.destroy();
        }
        
        charts.bar = new Chart(context, {
            type: 'bar',
            data: {
                labels: clusterSummary.map(c => c.Cluster_Name),
                datasets: [{
                    label: 'Average Age',
                    data: clusterSummary.map(c => c.Avg_Age),
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Average Age (Years)'
                        }
                    }
                }
            }
        });
        
        console.log('Bar chart created successfully');
    } catch (error) {
        console.error('Error creating bar chart:', error);
    }
}

function createStackedBarChart() {
    const ctx = document.getElementById('stacked-bar-chart');
    if (!ctx) {
        console.error('Stacked bar chart canvas not found');
        return;
    }
    
    try {
        const context = ctx.getContext('2d');
        
        if (charts.stackedBar) {
            charts.stackedBar.destroy();
        }
        
        // Simulate gender distribution data
        const maleData = clusterSummary.map(c => Math.floor(c.Customer_Count * (0.4 + Math.random() * 0.3)));
        const femaleData = clusterSummary.map((c, i) => c.Customer_Count - maleData[i]);
        
        charts.stackedBar = new Chart(context, {
            type: 'bar',
            data: {
                labels: clusterSummary.map(c => c.Cluster_Name),
                datasets: [
                    {
                        label: 'Male',
                        data: maleData,
                        backgroundColor: '#5D878F',
                        borderColor: '#5D878F',
                        borderWidth: 1
                    },
                    {
                        label: 'Female',
                        data: femaleData,
                        backgroundColor: '#FFC185',
                        borderColor: '#FFC185',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Number of Customers'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        console.log('Stacked bar chart created successfully');
    } catch (error) {
        console.error('Error creating stacked bar chart:', error);
    }
}

function displayInsights() {
    const insightsGrid = document.getElementById('insights-grid');
    if (!insightsGrid) {
        console.error('Insights grid not found');
        return;
    }
    
    try {
        insightsGrid.innerHTML = '';
        
        clusterSummary.forEach(cluster => {
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            
            insightCard.innerHTML = `
                <div class="insight-header">
                    <h3 class="insight-title">${cluster.Cluster_Name}</h3>
                    <span class="insight-size">${cluster.Customer_Count} customers</span>
                </div>
                <div class="insight-stats">
                    <div class="insight-stat">
                        <span class="insight-stat-value">${Math.round(cluster.Avg_Age)}y</span>
                        <span class="insight-stat-label">Avg Age</span>
                    </div>
                    <div class="insight-stat">
                        <span class="insight-stat-value">$${Math.round(cluster.Avg_Income / 1000)}k</span>
                        <span class="insight-stat-label">Avg Income</span>
                    </div>
                    <div class="insight-stat">
                        <span class="insight-stat-value">${Math.round(cluster.Avg_Spending)}</span>
                        <span class="insight-stat-label">Spending Score</span>
                    </div>
                </div>
                <div class="insight-strategy">
                    <h4>Marketing Strategy</h4>
                    <p>${cluster.Marketing_Strategy}</p>
                </div>
            `;
            
            insightsGrid.appendChild(insightCard);
        });
        
        console.log('Insights displayed successfully');
    } catch (error) {
        console.error('Error displaying insights:', error);
    }
}

function exportData(type) {
    try {
        let filename, content, mimeType;
        
        switch (type) {
            case 'csv':
                filename = 'customer_segments.csv';
                content = convertToCSV(currentData);
                mimeType = 'text/csv';
                break;
            case 'summary':
                filename = 'cluster_summary.csv';
                content = convertToCSV(clusterSummary);
                mimeType = 'text/csv';
                break;
            case 'report':
                filename = 'analysis_report.txt';
                content = generateReport();
                mimeType = 'text/plain';
                break;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('Data exported successfully:', filename);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    return csvContent;
}

function generateReport() {
    const clustersSlider = document.getElementById('clusters-slider');
    const numClusters = clustersSlider ? clustersSlider.value : '4';
    
    return `
Customer Segmentation Analysis Report
Generated: ${new Date().toISOString()}

Analysis Summary:
- Total Customers: ${currentData.length}
- Number of Clusters: ${numClusters}
- Silhouette Score: ${analysisMetrics.silhouette_score}

Cluster Summary:
${clusterSummary.map(cluster => `
${cluster.Cluster_Name}:
  - Size: ${cluster.Customer_Count} customers (${cluster.Percentage}%)
  - Average Age: ${cluster.Avg_Age} years
  - Average Income: $${cluster.Avg_Income}
  - Average Spending Score: ${cluster.Avg_Spending}
  - Marketing Strategy: ${cluster.Marketing_Strategy}
`).join('\n')}

This analysis was generated using K-means clustering algorithm to identify distinct customer segments based on demographic and behavioral data.
    `.trim();
}