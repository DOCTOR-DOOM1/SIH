import urllib.request
import json
import os

url = 'https://in.openfoodfacts.org/cgi/search.pl?search_terms=&page_size=50&action=process&json=1'
req = urllib.request.Request(url, headers={'User-Agent': 'SIH-Hackathon-App/1.0'})

print("Fetching data from OpenFoodFacts India...")
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        products = data.get('products', [])
        
        extracted = []
        for p in products:
            extracted.append({
                "gtin": p.get('code'),
                "company_name": p.get('brands', 'Unknown Brand'),
                "product_name": p.get('product_name', 'Unknown Product'),
                "fssai_number": p.get('generic_name', 'N/A')
            })
            print(f"Found: {p.get('brands')} - {p.get('product_name')}")
            
        print(f"Total products fetched: {len(extracted)}")
except Exception as e:
    print('Error:', e)
