# Customer Segmentation Project

## Table of Contents

- [Overview](#overview)
- [Dataset](#dataset)
- [Methodology](#methodology)
- [Results & Insights](#results--insights)
- [Project Structure](#project-structure)
- [Installation & Usage](#installation--usage)
- [API Endpoints](#api-endpoints)
- [Notebooks](#notebooks)
- [Requirements](#requirements)
- [License](#license)

## Overview

This project aims to segment mall customers into distinct groups using unsupervised machine learning techniques. The goal is to help businesses understand customer behavior, target marketing efforts, and personalize services. The solution includes:

- Data preprocessing and cleaning
- Clustering model development and evaluation
- API for serving segmentation results
- Visualizations and reporting

## Dataset

- **File:** `backend/data/raw/Mall_Customers.csv`
- **Features:**
  - `CustomerID`: Unique identifier
  - `Gender`: Male/Female
  - `Age`: Customer age
  - `Annual Income (k$)`: Annual income in thousands
  - `Spending Score (1-100)`: Score assigned by the mall
- **Description:**
  - The dataset contains 200 records of mall customers, capturing demographic and behavioral information. It is widely used for clustering and segmentation tasks in retail analytics.

## Methodology

### 1. Data Preprocessing

- Handle missing values and outliers
- Encode categorical variables (e.g., Gender)
- Scale numerical features for fair clustering
- Save processed data to `backend/data/processed/preprocessed_data.csv`

### 2. Clustering Model

- **Algorithm:** K-Means Clustering
- **Cluster Selection:**
  - The optimal number of clusters was determined using the **Silhouette Method**, which measures how similar an object is to its own cluster compared to other clusters.
  - The highest average silhouette score was achieved with **4 clusters**.
- **Model Output:**
  - Trained model saved as `backend/models/clustering_model.pkl`
  - Cluster assignments saved in `backend/data/processed/clustered_data.csv`

### 3. Visualization & Reporting

- 2D and 3D cluster visualizations:
  - `backend/reports/figures/Customer Segmentation 2D.png`
  - `backend/reports/figures/Customer Segmentation 3D.png`
- Detailed summary in `backend/reports/summary.txt`

## Results & Insights

- **Cluster Profiles:**
  - Cluster 1: Young, moderate income, moderate spending
  - Cluster 2: Older, high income, low spending
  - Cluster 3: High spending, varied income, often younger
  - Cluster 4: Low income, low spending
- **Business Value:**
  - Enables targeted marketing and personalized offers
  - Helps identify high-value and at-risk customer segments
- **Model Selection Rationale:**
  - Silhouette Method ensures well-separated, meaningful clusters
  - 4 clusters provide actionable segmentation without overfitting

## Project Structure

## Project Structure
```
Mall Customer Segmentation
├── backend/
│ ├── data/
│ │ ├── raw/
│ │ └── processed/
│ ├── models/
│ ├── notebooks/
│ ├── reports/
│ │ └── figures/
| | └──summary.txt 
│ ├── requirements.txt
│ └── src/
├── frontend/
│ ├── app/
│ ├── public/
│ ├── package.json
│ └── README.md
├── LICENSE
└── README.md
```
## Installation & Usage

### 1. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Run Main Script

```bash
python backend/src/main.py
```

### 3. Start API Server (Optional)

```bash
uvicorn backend.src.main:app --reload
```

## API Endpoints

The backend uses FastAPI to serve clustering results and other functionalities. Example endpoints:

- `/predict`: Get cluster assignment for new customer data
- `/clusters`: Retrieve information about clusters

## Notebooks

- **Preprocessing:** `backend/notebooks/preprocessing.ipynb`
- **Modeling:** `backend/notebooks/modeling.ipynb`

## Requirements

Main dependencies (see `backend/requirements.txt`):

- pandas
- numpy
- fastapi[standard]
- joblib
- matplotlib
- scikit-learn

## License

MIT
