import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [formData, setFormData] = useState({
    Gender: 0, 
    JobLevel: 1,
    YearsAtCompany: 1,
    Education: 1,
    Age: 25,
    MonthlyIncome: 0, 
  });

  const [predictedSalary, setPredictedSalary] = useState(null);
  const [fairnessScore, setFairnessScore] = useState(null);
  const [actualSalary, setActualSalary] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handlePredict = async () => {
    console.log("✅ Predict button clicked!"); // Check if the function runs
    try {
      console.log("Sending request with data:", formData);
      const res = await axios.post("http://127.0.0.1:5000/predict", formData);
      console.log("Response from API:", res.data);
      setPredictedSalary(res.data.PredictedSalary);
    } catch (error) {
      console.error("❌ Prediction Error:", error.response ? error.response.data : error);
    }
  };
  
  

  const handleFairness = async () => {
    console.log("✅ Fairness button clicked!");
    try {
      const data = { ...formData, MonthlyIncome: Number(actualSalary) };
      console.log("Sending fairness request:", data);
      const res = await axios.post("http://127.0.0.1:5000/fairness", data);
      console.log("Fairness API response:", res.data);
      setFairnessScore(res.data.FairnessScore);
    } catch (error) {
      console.error("❌ Fairness Error:", error.response ? error.response.data : error);
    }
  };
  
  
  
  

  return (
    <div className="container mt-5">
      <h2 className="text-center">Salary Fairness Analysis</h2>
      
      {/* Input Form */}
      <div className="card p-4">
        <h4>Enter Job Details</h4>
        <div className="form-group">
          <label>Gender:</label>
          <select name="Gender" className="form-control" onChange={handleChange}>
            <option value={0}>Female</option>
            <option value={1}>Male</option>
          </select>
        </div>

        <div className="form-group">
          <label>Job Level:</label>
          <input type="number" name="JobLevel" className="form-control" onChange={handleChange} value={formData.JobLevel} />
        </div>

        <div className="form-group">
          <label>Years at Company:</label>
          <input type="number" name="YearsAtCompany" className="form-control" onChange={handleChange} value={formData.YearsAtCompany} />
        </div>

        <div className="form-group">
          <label>Education Level:</label>
          <input type="number" name="Education" className="form-control" onChange={handleChange} value={formData.Education} />
        </div>

        <div className="form-group">
          <label>Age:</label>
          <input type="number" name="Age" className="form-control" onChange={handleChange} value={formData.Age} />
        </div>

        <button className="btn btn-primary mt-3" onClick={handlePredict}>Predict Salary</button>

        {predictedSalary !== null && (
          <div className="alert alert-info mt-3">
            Predicted Salary: ${predictedSalary}
          </div>
        )}
      </div>

      {/* Fairness Check */}
      <div className="card p-4 mt-4">
        <h4>Fairness Analysis</h4>
        <div className="form-group">
          <label>Your Actual Salary:</label>
          <input type="number" className="form-control" onChange={(e) => setActualSalary(e.target.value)} value={actualSalary} />
        </div>
        <button className="btn btn-success mt-3" onClick={handleFairness}>Check Fairness</button>

        {fairnessScore !== null && (
          <div className="alert alert-warning mt-3">
            Fairness Score: {fairnessScore}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
