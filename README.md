# 6th Semester Minor Project: Smart Parking System

This repository contains two components for the 6th Semester Minor Project:
1. **Smart Parking System (ANPR)**: A complete implementation using Computer Vision, Flask, and a frontend dashboard.
2. **Parking Problem Solution**: A mathematical/logical parking fee calculation approach and Python script.

---

# Part 1: Smart Parking System (ANPR)

A complete college project implementation for a Smart Parking System. It uses ANPR (Automatic Number Plate Recognition) via cameras instead of physical sensors per slot.

## Architecture

1. **Backend** (`backend/app.py`): A Flask API backed by MongoDB. Tracks total slots (100 initially), logs entry/exit times, and calculates parking duration.
2. **Computer Vision** (`cv_module/main.py`): Python scripts utilizing OpenCV and EasyOCR to act as the "Entry" and "Exit" cameras. It reads images, extracts plate text, and hits the backend APIs.
3. **Frontend Dashboard** (`frontend/index.html`): A dynamic, modern web UI with a Leaflet.js map. It polls the backend API to show real-time available slots at the parking location without refreshing.

## Prerequisites

- **Python 3.8+**
- **MongoDB**: You must have a MongoDB instance running locally (default `mongodb://localhost:27017/`), or you can pass a connection string via environment variable `MONGO_URI`.
- **Node.js**: (Optional) For serving the frontend via a simple server like `http-server`.

## Setup & Running Step-by-Step

### 1. Database
Ensure your MongoDB service is running on your machine.
- Windows: `net start MongoDB` (if installed as service)
- Or simply run `mongod` in a separate terminal.

### 2. Run the Backend API
Navigate to the `backend/` folder:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python app.py
```
*The API will start at `http://localhost:5000/`.*

### 3. Serve the Frontend Dashboard
You can simply open `frontend/index.html` in your browser.
Or, for a better experience, serve it using Python's http.server or Node's http-server.

```bash
cd frontend
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser. You will see the beautiful dashboard polling the live slots. By default, it will show `100 / 100`.

### 4. Run the Computer Vision (ANPR) Module
To simulate a car entering or exiting the parking lot, you run the CV script. Provide an image of a car with a clear license plate.

```bash
cd cv_module
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
```

**Simulate Car Entry:**
```bash
python main.py --image "path/to/car_image.jpg" --event entry
```
*Look at the frontend dashboard: The slots should instantly drop to 99!*

**Simulate Car Exit:**
(Use an image with the same license plate so it matches)
```bash
python main.py --image "path/to/same_car_image.jpg" --event exit
```
*Look at the frontend dashboard: The slots should jump back up to 100, and the database will log the total parked time.*

## Customization
- **Total Capacity:** You can change `TOTAL_CAPACITY = 100` in `backend/app.py`.
- **Map Location:** You can edit `PARKING_LAT` and `PARKING_LNG` in `frontend/script.js` to change the map pin coordinates.
- **Styling:** Feel free to tweak `frontend/style.css` to change the glassmorphism colors and gradients.

## OCR Evaluation Workflow

Industry-level accuracy ki taraf practical start `evaluation first` hai.

### 1. Prepare labeled images
- Images ko `datasets/eval_images/` me rakho
- Labels ko `datasets/eval_template.csv` format me fill karo
- Details `datasets/README.md` me milengi

### 2. Run OCR evaluation
Project root se:
```bash
python tools/evaluate_ocr.py --csv datasets/eval_template.csv --root .
```
Optional JSON report:
```bash
python tools/evaluate_ocr.py --csv datasets/eval_template.csv --root . --save-json reports/eval_report.json
```

### 3. Capture data from laptop camera
Testing ke liye laptop camera se labeled samples capture kar sakte ho:
```bash
python tools/capture_dataset.py --camera 0 --output-dir datasets/captured --csv datasets/captured_labels.csv
```
Ek known plate ke repeated samples:
```bash
python tools/capture_dataset.py --camera 0 --label MH12AB1234 --notes day-front
```

### 4. Core metrics
Evaluation script ye metrics dega:
- exact match rate
- average character accuracy
- false positive rate
- missed detection rate

---

# Part 2: Parking Problem Solution

This document provides two solutions for a parking problem: a mathematical/logical approach and a Python implementation that follows standard software engineering practices.

## Table of Contents
1. Problem Statement
2. Understanding the Constraints
3. Mathematical/Logical Solution
4. Python Implementation (Production Ready)
5. How to Run
6. Test Cases

## 1. Problem Statement
A parking garage has N floors and K spots per floor. It costs ₹20 per hour, with a maximum fee of ₹100. Given entry and exit times for cars, calculate the total parking charges for each car.

## 2. Understanding the Constraints
- 24-hour clock format
- Duration = Exit - Entry
- Maximum daily charge = ₹100

## 3. Mathematical/Logical Solution
The core logic involves converting the time difference into hours and then applying the pricing rule.

### 3.1 Steps
1. Parse the entry and exit timestamps.
2. Calculate the duration in hours:
   `Duration = (Exit Hour - Entry Hour) + (Exit Minute - Entry Minute) / 60`
3. Apply the pricing rule:
   - If Duration is 0, charge ₹0.
   - If Duration > 0 and <= 1, charge ₹20.
   - If Duration > 1 and <= 2, charge ₹40.
   - ...and so on, increasing by ₹20 for each hour.
   - capping at ₹100.
4. Using Mathematical Formula:
   `Cost = min(20 * hours, 100), where hours = ceil(Duration).`

## 4. Python Implementation (Production Ready)
The following implementation follows standard software engineering practices:
- Functions for modularity
- Proper docstrings and type hints
- Error handling
- Readable variable names

### 4.1 Code
```python
import math
from typing import List, Dict

def calculate_hours(entry_time: str, exit_time: str) -> float:
    """
    Calculates parking duration in hours.
    
    Args:
        entry_time: Entry time in HH:MM format
        exit_time: Exit time in HH:MM format
        
    Returns:
        Duration in hours (float)
    """
    e_h, e_m = map(int, entry_time.split(':'))
    x_h, x_m = map(int, exit_time.split(':'))
    
    # Convert to minutes for accurate calculation
    entry_minutes = e_h * 60 + e_m
    exit_minutes = x_h * 60 + x_m
    
    duration_minutes = exit_minutes - entry_minutes
    
    if duration_minutes < 0:
        # Handle overnight parking if needed, or assume valid input
        # For this problem, assuming exit > entry
        raise ValueError("Exit time must be after entry time")
    
    duration_hours = duration_minutes / 60.0
    return duration_hours

def calculate_parking_charge(entry_time: str, exit_time: str) -> int:
    """
    Calculates parking charge based on duration and pricing rules.
    
    Args:
        entry_time: Entry time in HH:MM format
        exit_time: Exit time in HH:MM format
        
    Returns:
        Total parking charge in rupees
    """
    # 0 duration = ₹0 charge
    if entry_time == exit_time:
        return 0
        
    duration_hours = calculate_hours(entry_time, exit_time)
    
    # Calculate charge: ₹20 per hour, max ₹100
    # We use math.ceil to round up to the nearest hour
    hours = math.ceil(duration_hours)
    
    charge = min(hours * 20, 100)
    return charge

def process_parking_records(records: List[Dict]) -> List[Dict]:
    """
    Processes multiple parking records and calculates charges.
    
    Args:
        records: List of parking records with entry_time and exit_time
        
    Returns:
        List of records with calculated charges
    """
    processed_records = []
    
    for record in records:
        try:
            entry = record['entry_time']
            exit_t = record['exit_time']
            
            charge = calculate_parking_charge(entry, exit_t)
            
            processed_records.append({
                "entry_time": entry,
                "exit_time": exit_t,
                "charge": charge
            })
        except Exception as e:
            print(f"Error processing record {record}: {e}")
            processed_records.append({
                "entry_time": record.get('entry_time'),
                "exit_time": record.get('exit_time'),
                "charge": "Error"
            })
            
    return processed_records

# Example Usage
records = [
    {"entry_time": "10:00", "exit_time": "12:30"},
    {"entry_time": "09:15", "exit_time": "09:45"},
    {"entry_time": "14:00", "exit_time": "19:00"}
]

processed = process_parking_records(records)
print(processed)
```

## 5. How to Run

Save the code:
Save the code above as `parking_calculator.py`

Run from terminal:
```bash
python parking_calculator.py
```

## 6. Test Cases

| Test Case | Times | Duration (hours) | Ceil Hours | Charge (₹) |
|---|---|---|---|---|
| 1 | 10:00 - 12:30 | 2.5 | 3 | ₹60 |
| 2 | 09:15 - 09:45 | 0.5 | 1 | ₹20 |
| 3 | 14:00 - 19:00 | 5.0 | 5 | ₹100 (Max) |
| 4 | 10:00 - 10:00 | 0.0 | 0 | ₹0 |
| 5 | 07:00 - 17:00 | 10.0 | 10 | ₹100 (Max) |
| 6 | 08:30 - 08:45 | 0.25 | 1 | ₹20 |
