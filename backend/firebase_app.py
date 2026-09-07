import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage, firestore

load_dotenv()

# Initialize Firebase Admin
def init_firebase():
    if not firebase_admin._apps:
        # 1. Try loading from FIREBASE_CREDENTIALS_JSON environment variable first
        cred_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
        if cred_json:
            try:
                import json
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'default-bucket.appspot.com')
                })
                print("Firebase initialized successfully from environment variable.")
                return
            except Exception as e:
                print(f"WARNING: Firebase init failed from FIREBASE_CREDENTIALS_JSON: {e}")

        # 2. Fallback to credentials.json file
        cred_path = os.path.join(os.path.dirname(__file__), "credentials.json")
        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'default-bucket.appspot.com')
                })
                print("Firebase initialized successfully from credentials.json file.")
            except Exception as e:
                print(f"WARNING: Firebase init failed (invalid credentials?): {e}")
        else:
            print("WARNING: credentials.json not found and FIREBASE_CREDENTIALS_JSON not set. Firebase will not work.")

init_firebase()

def get_firestore_client():
    return firestore.client()

def get_storage_bucket():
    return storage.bucket()
