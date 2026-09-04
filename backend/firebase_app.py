import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage, firestore

load_dotenv()

# Initialize Firebase Admin
def init_firebase():
    if not firebase_admin._apps:
        # Load from credentials.json
        cred_path = os.path.join(os.path.dirname(__file__), "credentials.json")
        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'default-bucket.appspot.com')
                })
            except Exception as e:
                print(f"WARNING: Firebase init failed (invalid credentials?): {e}")
        else:
            print("WARNING: credentials.json not found. Firebase will not work.")

init_firebase()

def get_firestore_client():
    return firestore.client()

def get_storage_bucket():
    return storage.bucket()
