import json
import os
import re

RAG_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rag_database.json")

def load_rag_database():
    try:
        with open(RAG_DB_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading RAG Database: {e}")
        return []

def extract_potential_keys(full_text: str):
    """Extracts potential 13-digit GTINs and 14-digit FSSAI numbers from raw OCR text."""
    gtins = re.findall(r'\b(\d{13})\b', full_text)
    fssais = re.findall(r'\b(\d{14})\b', full_text)
    return gtins, fssais

def lookup_in_rag(full_text: str, external_barcode: str = None):
    """
    Searches the verified RAG database for a match based on GTIN or FSSAI number.
    Returns the exact verified record if found, else None.
    """
    db = load_rag_database()
    gtins, fssais = extract_potential_keys(full_text)
    
    if external_barcode:
        gtins.append(external_barcode)
        
    for record in db:
        if record.get("gtin") in gtins:
            print("RAG MATCH FOUND via GTIN")
            return record
            
        if record.get("fssai_number") in fssais:
            print("RAG MATCH FOUND via FSSAI")
            return record
            
    print("NO RAG MATCH FOUND. Falling back to Google Search Grounding.")
    return None
