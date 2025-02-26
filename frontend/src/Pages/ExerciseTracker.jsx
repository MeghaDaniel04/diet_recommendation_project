import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ExerciseTracker.css"


const exercises = ["Running", "Cycling", "Swimming", "Custom"];

const ExerciseTracker = () => {
  const [exercise, setExercise] = useState("");
  const [customExercise, setCustomExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [weight, setWeight] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [exerciseLogs, setExerciseLogs] = useState([]);

  useEffect(() => {
    fetchExerciseLogs();
  }, []);

  const fetchExerciseLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`api/exercise-log`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExerciseLogs(response.data);
    } catch (error) {
      console.error("Error fetching exercise logs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const exerciseType = exercise === "custom" ? customExercise : exercise;

      const response = await axios.post(
        `api/submit-exercise-log`,
        {
          exercise: exerciseType,
          duration,
          weight,
          intensity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCaloriesBurned(response.data.calories_burned);
      fetchExerciseLogs(); // Refresh logs after submission
    } catch (error) {
      console.error("Error calculating calories:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Exercise Tracker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Exercise Type:</label>
          <select value={exercise} onChange={(e) => setExercise(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select Exercise</option>
            {exercises.map((ex) => (
                <option key={ex.toLowerCase()} value={ex.toLowerCase()}>
                {ex}
                </option>
            ))}
            </select>
        </div>

        {exercise === "custom" && (
          <div>
            <label className="block">Custom Exercise:</label>
            <input
              type="text"
              value={customExercise}
              onChange={(e) => setCustomExercise(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter exercise name"
            />
          </div>
        )}

        <div>
          <label className="block">Duration (minutes):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block">Weight (kg):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block">Intensity:</label>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="intense">Intense</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Calculate
        </button>
      </form>

      {caloriesBurned !== null && (
        <p className="mt-4 text-lg font-semibold">Calories Burned: {caloriesBurned.toFixed(2)} kcal</p>
      )}

      {/* Display Exercise Logs */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Exercise Logs</h3>
        {exerciseLogs.length === 0 ? (
          <p>No exercise logs available.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {exerciseLogs.map((log, index) => (
              <li key={index} className="p-2 border rounded">
                <strong>{log.exercise}</strong> - {log.duration} min, {log.calories_burned.toFixed(2)} kcal burned
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExerciseTracker;
