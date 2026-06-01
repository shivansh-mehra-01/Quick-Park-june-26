import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def restore_balance():
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri)
        db = client['smart_parking']
        result = db['users'].update_many({}, {'$set': {'wallet_balance': 500.0}})
        print(f"✅ Successfully restored balance for {result.modified_count} users on Cloud DB!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    restore_balance()
