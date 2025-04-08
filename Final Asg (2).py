from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS  # ✅ Import CORS

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Load and preprocess data
df = pd.read_csv("HR_Analytics.csv").dropna()
df['Gender'] = df['Gender'].map({'Male': 1, 'Female': 0})

# Feature selection
features = ['Gender', 'JobLevel', 'YearsAtCompany', 'Education', 'Age']
X = df[features]
y = df['MonthlyIncome']

# Fix warning by using .loc[:, features]
scaler = StandardScaler()
X.loc[:, features] = scaler.fit_transform(X[features])

# Train and save model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)
joblib.dump(model, 'salary_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

@app.route('/')
def home():
    return "Salary Fairness API is running!"

@app.route('/predict', methods=['POST'])
def predict_salary():
    try:
        data = request.json
        input_data = pd.DataFrame([data])

        # Load model and scaler
        model = joblib.load('salary_model.pkl')
        scaler = joblib.load('scaler.pkl')

        # Ensure correct features
        input_data = input_data[features]
        input_data = scaler.transform(input_data)

        # Predict salary
        predicted_salary = model.predict(input_data)[0]

        return jsonify({'PredictedSalary': round(predicted_salary, 2)})

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/fairness', methods=['POST'])
def compute_fairness():
    try:
        data = request.json
        input_data = pd.DataFrame([data])

        # Load model and scaler
        model = joblib.load('salary_model.pkl')
        scaler = joblib.load('scaler.pkl')

        # Ensure correct features
        input_data = input_data[features]
        input_data = scaler.transform(input_data)

        # Predict salary
        predicted_salary = model.predict(input_data)[0]
        actual_salary = data.get("MonthlyIncome", 0)  # MonthlyIncome is allowed here

        # Compute fairness score
        if predicted_salary > 0:
            fairness_score = min(actual_salary / predicted_salary, 1) if actual_salary < predicted_salary else 1 - (
                (actual_salary - predicted_salary) / predicted_salary)
        else:
            fairness_score = 0  # Avoid division by zero

        return jsonify({
            'PredictedSalary': round(predicted_salary, 2),
            'ActualSalary': actual_salary,
            'FairnessScore': round(fairness_score, 2)
        })

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
