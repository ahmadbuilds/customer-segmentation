import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

Base_PATH=os.path.dirname(os.path.abspath(__file__))
kmeans_model=joblib.load(os.path.join(Base_PATH,'..','models','clustering_model.pkl'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

class CustomerData(BaseModel):
    Age: int
    Gender: str
    AnnualIncome: int
    SpendingScore: int

cluster_label={
    0:"Average Income - Average Spending(old Customer)",
    1:"High Income - High Spending(young customer)",
    2:"Low Income - Moderate Spending(young customer)",
    3:"High Income - Low Spending(Mid-aged customer)"
}

@app.post("/predict")
def predict_segment(data: CustomerData):
    
    input_data = pd.DataFrame([{
        "Age": data.Age,
        "Gender": data.Gender.capitalize(),
        "Annual Income (k$)": data.AnnualIncome,
        "Spending Score (1-100)": data.SpendingScore
    }])

    prediction = kmeans_model.predict(input_data)

    return {"segment": int(prediction[0]),
        "description": cluster_label[int(prediction[0])]
    }
