from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from app import mongo

exercise_data = Blueprint('exercise_routes', __name__)

# Route to get all exercise logs for the authenticated user
@exercise_data.route('/exercise-log', methods=['GET'])
@jwt_required()
def get_exercise_logs():
    try:
        user_id = get_jwt_identity()  # Get the logged-in user ID
        logs = list(mongo.db.exercise_logs.find({"user_id": user_id}, {"_id": 0}))  # Fetch logs for the user
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to submit a new exercise log
@exercise_data.route('/submit-exercise-log', methods=['POST'])
@jwt_required()
def submit_exercise_log():
    try:
        data = request.json
        user_id = get_jwt_identity()  # Get the logged-in user ID

        exercise = data.get("exercise", "").lower()
        duration = float(data.get("duration", 0))
        weight = float(data.get("weight", 0))
        intensity = data.get("intensity", "moderate").lower()
        timestamp = datetime.now(timezone.utc)

        if duration <= 0 or weight <= 0 or not exercise:
            return jsonify({"error": "Invalid input"}), 400

        # MET values for common exercises (default 5.0 for custom exercises)
        MET_VALUES = {
            "running": {"light": 6.0, "moderate": 9.8, "intense": 11.5},
            "cycling": {"light": 4.0, "moderate": 8.0, "intense": 10.0},
            "swimming": {"light": 5.5, "moderate": 9.5, "intense": 11.0},
        }
        met = MET_VALUES.get(exercise, {}).get(intensity, 5.0)

        # Calculate calories burned
        calories_burned = (met * weight * duration) / 60

        # Create the exercise log entry
        exercise_log = {
            "user_id": user_id,
            "exercise": exercise,
            "duration": duration,
            "weight": weight,
            "intensity": intensity,
            "calories_burned": calories_burned,
            "timestamp": timestamp
        }

        # Insert into MongoDB
        mongo.db.exercise_logs.insert_one(exercise_log)

        return jsonify({"message": "Exercise log saved successfully", "calories_burned": calories_burned}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
