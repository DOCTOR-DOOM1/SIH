from firebase_admin import firestore
from datetime import datetime, timezone

def verify_batch_authenticity(gtin: str, batch_no: str) -> dict:
    """
    Simulates a Supply Chain Ledger using Firestore.
    Tracks how many times a specific GTIN + Batch/Serial Number has been scanned.
    If the scan velocity is too high, it flags the product as a cloned counterfeit.
    """
    if not gtin or not batch_no:
        return {
            "is_authentic": True,
            "message": "No Batch/Serial number detected to verify against the ledger."
        }
        
    db = firestore.client()
    doc_id = f"{gtin}_{batch_no}"
    doc_ref = db.collection("supply_chain_ledger").document(doc_id)
    
    try:
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            scan_count = data.get("scan_count", 0)
            
            # For hackathon demo purposes: we assume if a specific 'unique' batch/serial 
            # is scanned more than 3 times globally, it's a physical clone.
            if scan_count >= 3:
                # Update the count anyway
                doc_ref.update({
                    "scan_count": firestore.Increment(1),
                    "last_scanned_at": datetime.now(timezone.utc)
                })
                return {
                    "is_authentic": False,
                    "message": f"CRITICAL: Batch {batch_no} has been scanned {scan_count + 1} times across different locations. CLONED COUNTERFEIT DETECTED."
                }
            else:
                doc_ref.update({
                    "scan_count": firestore.Increment(1),
                    "last_scanned_at": datetime.now(timezone.utc)
                })
                return {
                    "is_authentic": True,
                    "message": f"Batch {batch_no} verified. Scan count: {scan_count + 1}."
                }
        else:
            # First time this batch/serial is scanned by a consumer
            doc_ref.set({
                "gtin": gtin,
                "batch_no": batch_no,
                "scan_count": 1,
                "first_scanned_at": datetime.now(timezone.utc),
                "last_scanned_at": datetime.now(timezone.utc)
            })
            return {
                "is_authentic": True,
                "message": f"Batch {batch_no} verified and registered in ledger."
            }
            
    except Exception as e:
        print(f"Ledger Service Error: {e}")
        # Fail open if DB is down so we don't break the main app
        return {
            "is_authentic": True,
            "message": "Ledger verification temporarily unavailable."
        }
