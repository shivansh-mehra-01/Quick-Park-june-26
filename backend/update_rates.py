import os
from dotenv import load_dotenv
from pymongo import MongoClient
import random

load_dotenv()

def update_parking_rates():
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri)
        db = client['smart_parking']
        parkings_collection = db['parkings']

        # Get all parkings
        parkings = list(parkings_collection.find({}))
        print(f"Found {len(parkings)} parkings to update.")

        for parking in parkings:
            # Generate a random rate between 20 and 60
            new_rate = random.choice([20, 30, 40, 50, 60])
            parkings_collection.update_one(
                {'_id': parking['_id']},
                {'$set': {'rate_per_hour': new_rate}}
            )
            name = parking.get('name', 'Unknown').encode('ascii', 'ignore').decode('ascii')
            print(f"Updated {name} with rate: Rs.{new_rate}/hr")

        print("\nAll parking rates updated successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_parking_rates()
