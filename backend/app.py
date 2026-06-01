from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os

app = Flask(__name__)
# Sabhi origins allow kar rahe hain development ke liye
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB Configuration
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Trigger a connection check
    client.admin.command('ping')
    db = client["smart_parking"]
    parking_collection = db["parking_records"]
    status_collection = db["parking_status"]
    users_collection = db["users"]
    payments_collection = db["payments"]
    parkings_collection = db["parkings"]

    # Initialize available slots if not present
    TOTAL_CAPACITY = 100
    status = status_collection.find_one({"_id": "status"})
    if not status:
        status_collection.insert_one({"_id": "status", "available_slots": TOTAL_CAPACITY})

    # Create Indexes for Speed
    parking_collection.create_index([("Plate_Number", 1), ("Exit_Time", 1)])
    parking_collection.create_index("Plate_Number")
    users_collection.create_index("email", unique=True)
except Exception as e:
    print(f"CRITICAL ERROR: Could not connect to MongoDB: {e}")
    # Fallback for empty collections to avoid crashes later
    parking_collection = db["parking_records"] if 'db' in locals() else None
    parkings_collection = db["parkings"] if 'db' in locals() else None

# ── Parking Routes ──

@app.route("/auth/parkings", methods=["GET"])
@app.route("/api/parkings", methods=["GET"])
@app.route("/parkings", methods=["GET"])
def get_parkings():
    # Fetch all parking lots from MongoDB
    data = list(parkings_collection.find({}, {"_id": 1, "name": 1, "total_capacity": 1, "available_slots": 1}))
    
    # If it's a call from the Login screen (wants just names)
    if request.path == "/auth/parkings":
        return jsonify([p["name"] for p in data] if data else ["Aashima Mall Parking"]), 200
    # Fetch all parking lots from MongoDB
    data = list(parkings_collection.find({}, {"_id": 1, "name": 1, "total_capacity": 1, "available_slots": 1}))
    
    # Convert ObjectId to string for JSON
    for item in data:
        item["_id"] = str(item["_id"])
        
    # ── Fallback: Agar DB khali hai toh default data bhej do ──
    if not data:
        return jsonify([{
            "_id": "local-parking-001",
            "name": "Aashima Mall Parking",
            "total_capacity": 100,
            "available_slots": 100
        }]), 200
        
    return jsonify(data), 200

# ── Profile Routes ──

# ── Auth Routes ──

@app.route("/api/signup", methods=["POST"])
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    vehicle_plate = data.get("vehicle_plate")
    
    if not email or not password or not vehicle_plate:
        return jsonify({"error": "Email, password, and at least one vehicle plate are required"}), 400
        
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400
        
    hashed_password = generate_password_hash(password)
    user = {
        "email": email,
        "password": hashed_password,
        "full_name": full_name,
        "wallet_balance": 500.0,  # Welcome balance
        "vehicles": [vehicle_plate.upper()]
    }
    users_collection.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201

@app.route("/auth/login", methods=["POST"])
@app.route("/api/login", methods=["POST"])
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    
    # Compatibility with Hardware Key Login (Imported UI)
    if "device_key" in data:
        parking_name = data.get("parking_name")
        device_key = data.get("device_key")
        parking = parkings_collection.find_one({"name": parking_name, "deviceKey": device_key})
        if parking:
            return jsonify({"message": "Hardware access authorized", "parking": parking_name}), 200
        return jsonify({"detail": "Invalid Hardware Key"}), 401
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    user = users_collection.find_one({"email": email})
    if user and check_password_hash(user["password"], password):
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        del user["password"] # Security
        return jsonify({"message": "Login successful", "user": user}), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@app.route("/profile/<email>", methods=["GET"])
def get_user_profile(email):
    print(f"DEBUG: Profile request for email: {email}")
    user = users_collection.find_one({"email": email})
    if not user:
        print(f"DEBUG: User {email} not found in database!")
        return jsonify({"error": "User not found", "wallet_balance": 0.0}), 404
        
    # Convert ObjectId
    user["_id"] = str(user["_id"])
    if "password" in user: del user["password"]
    return jsonify(user), 200

@app.route("/profile", methods=["GET"])
def get_profile():
    parking_name = request.args.get("parking_name")
    if not parking_name:
        return jsonify({"name": "Manager", "role": "Admin", "facility_name": "Smart Parking", "address": "Bhopal"}), 200
        
    p_doc = parkings_collection.find_one({"name": parking_name})
    if p_doc:
        return jsonify({
            "name": p_doc.get("name"),
            "role": "Facility Manager",
            "facility_name": p_doc.get("name"),
            "address": f"{p_doc.get('area')}, {p_doc.get('city')}",
            "avatar_initial": p_doc.get("name")[0] if p_doc.get("name") else "P"
        }), 200
    
    return jsonify({"name": parking_name, "role": "Manager", "facility_name": parking_name}), 200

@app.route("/profile", methods=["POST"])
def update_profile():
    data = request.json
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    update_data = {
        "full_name": data.get("full_name"),
        "phone": data.get("phone"),
        "vehicles": data.get("vehicles", [])
    }
    
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    users_collection.update_one(
        {"email": email},
        {"$set": update_data},
        upsert=True
    )
    return jsonify({"message": "Profile updated successfully"}), 200

@app.route("/status", methods=["GET"])
def get_status():
    status = status_collection.find_one({"_id": "status"})
    return jsonify({"available_slots": status.get("available_slots", 0), "total_capacity": TOTAL_CAPACITY})

@app.route("/api/vehicle-entry", methods=["POST"])
@app.route("/vehicle-entry", methods=["POST"])
@app.route("/entry", methods=["POST"])
def vehicle_entry():
    data = request.json
    # Handle both camelCase (from LPR script) and snake_case (from frontend)
    plate_number = data.get("plateNumber") or data.get("plate_number")
    parking_id = data.get("parkingId") or data.get("parking_id")
    
    if not plate_number:
        return jsonify({"error": "Plate number is required"}), 400

    # Convert parking_id to ObjectId for DB query
    p_oid = parking_id
    if parking_id and len(parking_id) == 24:
        try:
            p_oid = ObjectId(parking_id)
        except:
            pass

    # Ensure the car isn't already parked
    existing = parking_collection.find_one({"Plate_Number": plate_number, "Exit_Time": None})
    if existing:
        return jsonify({"error": "Vehicle already parked"}), 400

    # Check available slots from the specific parking lot
    parking = parkings_collection.find_one({"_id": p_oid})
    if not parking:
        # Fallback to status_collection if parking_id not found in parkings
        status = status_collection.find_one({"_id": "status"})
        available_slots = status.get("available_slots", 0)
    else:
        available_slots = parking.get("available_slots", 0)

    if available_slots <= 0:
        return jsonify({"error": "Parking is full"}), 400

    entry_time = datetime.now()
    
    # Save entry record with parking_id AND name
    record = {
        "Plate_Number": plate_number,
        "Parking_Id": parking_id,
        "Parking_Name": parking.get("name") if parking else "Aashima Mall Parking",
        "Entry_Time": entry_time,
        "Exit_Time": None,
        "Total_Time": None
    }
    parking_collection.insert_one(record)

    # Decrease available slot count for this specific parking
    if parking:
        parkings_collection.update_one({"_id": p_oid}, {"$inc": {"available_slots": -1}})
    else:
        status_collection.update_one({"_id": "status"}, {"$inc": {"available_slots": -1}})

    return jsonify({"message": f"Vehicle {plate_number} entered at {parking.get('name') if parking else 'Parking'}", "available_slots": available_slots - 1}), 201

@app.route("/api/vehicle-exit", methods=["POST"])
@app.route("/vehicle-exit", methods=["POST"])
@app.route("/exit", methods=["POST"])
def vehicle_exit():
    data = request.json
    plate_number = data.get("plateNumber") or data.get("plate_number")
    
    if not plate_number:
        return jsonify({"error": "Plate number is required"}), 400

    # Find the active parking record
    query = {"Plate_Number": plate_number, "Exit_Time": None}
    
    # Pehle try karo plate number se dhoondhne ki
    record = parking_collection.find_one(query)
    
    if not record:
        return jsonify({"error": f"Vehicle {plate_number} not found in parking"}), 404
    
    # Use the parking_id from the record
    p_id = record.get("Parking_Id")
    
    # Fetch rate from the specific parking lot
    rate_per_hour = 30 # Default
    p_oid = p_id
    if p_id and len(p_id) == 24:
        try: p_oid = ObjectId(p_id)
        except: pass
    
    parking_doc = parkings_collection.find_one({"_id": p_oid})
    if parking_doc:
        rate_per_hour = parking_doc.get("rate_per_hour", 30)

    exit_time = datetime.now()
    entry_time = record["Entry_Time"]
    
    # Calculate duration and fee
    duration = exit_time - entry_time
    total_time_minutes = duration.total_seconds() / 60
    # Minimum 1 hour charge, then per hour
    total_fee = max(rate_per_hour, (int(total_time_minutes) // 60 + 1) * rate_per_hour)
    
    print(f"DEBUG: Vehicle {plate_number} stayed for {total_time_minutes} mins at {parking_doc.get('name') if parking_doc else 'Parking'}. Rate: {rate_per_hour}/hr. Total Fee: {total_fee}")

    # Automated Payment (FASTag style)
    # Use case-insensitive search for the vehicle plate
    user = users_collection.find_one({"vehicles": {"$regex": f"^{plate_number}$", "$options": "i"}})
    
    payment_status = "Paid (Cash)"
    auto_pay_msg = "Cash payment required at exit."
    
    if user:
        print(f"DEBUG: User found for plate {plate_number}: {user['email']}")
        wallet_balance = user.get("wallet_balance", 0)
        if wallet_balance >= total_fee:
            new_balance = wallet_balance - total_fee
            users_collection.update_one({"_id": user["_id"]}, {"$set": {"wallet_balance": new_balance}})
            payment_status = "Paid (Wallet)"
            auto_pay_msg = f"FASTag detected! Rs.{total_fee} deducted from wallet. New Balance: Rs.{new_balance}"
            print(f"DEBUG: Payment successful. New balance: {new_balance}")
        else:
            auto_pay_msg = "FASTag user found but insufficient balance. Please pay cash."
            print(f"DEBUG: Insufficient balance for user {user['email']}")
    else:
        print(f"DEBUG: No user found for plate {plate_number}")

    # Update the parking record
    parking_collection.update_one(
        {"_id": record["_id"]},
        {"$set": {
            "Exit_Time": exit_time, 
            "Total_Time": f"{int(total_time_minutes)} mins",
            "Fee": total_fee,
            "Payment_Status": payment_status
        }}
    )

    # Save Payment Record
    payment = {
        "record_id": record["_id"],
        "user_id": user["_id"] if user else None,
        "plate_number": plate_number,
        "amount": total_fee,
        "status": payment_status,
        "timestamp": exit_time
    }
    payments_collection.insert_one(payment)

    # Increase available slot count for this specific parking
    target_id = p_id
    if p_id and isinstance(p_id, str) and len(p_id) == 24:
        try:
            target_id = ObjectId(p_id)
        except:
            pass

    if target_id:
        parkings_collection.update_one({"_id": target_id}, {"$inc": {"available_slots": 1}})
    else:
        status_collection.update_one({"_id": "status"}, {"$inc": {"available_slots": 1}})

    # Fetch fresh available slots for response
    available_now = 0
    if target_id:
        p_doc = parkings_collection.find_one({"_id": target_id})
        available_now = p_doc.get("available_slots", 0) if p_doc else 0

    return jsonify({
        "message": f"Vehicle {plate_number} exited. {auto_pay_msg}",
        "vehicle": {
            "entryTime": entry_time.isoformat(),
            "exitTime": exit_time.isoformat(),
            "total_time": int(total_time_minutes)
        },
        "fee": total_fee,
        "payment_status": payment_status,
        "available_slots": available_now
    }), 200

@app.route("/dashboard/stats", methods=["GET"])
def dashboard_stats():
    parking_name = request.args.get("parking_name")
    print(f"DEBUG: Dashboard stats requested for: {parking_name}")
    
    # Handle 'null' string from frontend
    if parking_name == "null" or not parking_name:
        parking_name = None

    # Base filter
    filter_query = {}
    p_capacity = TOTAL_CAPACITY
    
    if parking_name:
        filter_query["Parking_Name"] = parking_name
        # Get actual capacity from parkings collection
        p_doc = parkings_collection.find_one({"name": parking_name})
        if p_doc:
            p_capacity = p_doc.get("total_capacity", TOTAL_CAPACITY)

    # 1. Total active sessions for THIS parking
    active_sessions = parking_collection.count_documents({**filter_query, "Exit_Time": None})
    
    # 2. Entries/Exits today for THIS parking
    from datetime import datetime
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    entries_today = parking_collection.count_documents({**filter_query, "Entry_Time": {"$gte": today_start}})
    exits_today = parking_collection.count_documents({**filter_query, "Exit_Time": {"$gte": today_start}})
    
    # 3. Recent Logs for THIS parking
    recent_logs = list(parking_collection.find(filter_query).sort("Entry_Time", -1).limit(10))
    formatted_logs = []
    for log in recent_logs:
        formatted_logs.append({
            "_id": str(log["_id"]),
            "plate_text": log.get("Plate_Number", "Unknown"),
            "status": "inside" if log.get("Exit_Time") is None else "exited",
            "entry_time": log.get("Entry_Time").isoformat() if log.get("Entry_Time") else None,
            "exit_time": log.get("Exit_Time").isoformat() if log.get("Exit_Time") else None
        })

    return jsonify({
        "total_capacity": p_capacity,
        "active_sessions": active_sessions,
        "entries_today": entries_today,
        "exits_today": exits_today,
        "avg_dwell_time_mins": 45,
        "recent_logs": formatted_logs
    }), 200

@app.route("/occupancy/live", methods=["GET"])
def live_occupancy():
    parking_name = request.args.get("parking_name")
    filter_query = {"Exit_Time": None}
    
    p_capacity = TOTAL_CAPACITY
    if parking_name:
        filter_query["Parking_Name"] = parking_name
        p_doc = parkings_collection.find_one({"name": parking_name})
        if p_doc:
            p_capacity = p_doc.get("total_capacity", TOTAL_CAPACITY)

    active_sessions = list(parking_collection.find(filter_query).sort("Entry_Time", -1))
    
    formatted_sessions = []
    for s in active_sessions:
        formatted_sessions.append({
            "_id": str(s["_id"]),
            "plate_text": s.get("Plate_Number", "Unknown"),
            "entry_time": s.get("Entry_Time").isoformat() if s.get("Entry_Time") else None,
            "source": "Entry Cam"
        })

    return jsonify({
        "total_capacity": p_capacity,
        "sessions": formatted_sessions
    }), 200

@app.route("/active-vehicles", methods=["GET"])
def active_vehicles():
    """Abhi park ki hui gaadiyaan — Exit camera ke fast fuzzy match ke liye."""
    records = list(parking_collection.find({"Exit_Time": None}, {"_id": 0, "Plate_Number": 1}))
    plates = [{"plateNumber": r["Plate_Number"]} for r in records if r.get("Plate_Number")]
    return jsonify(plates), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
