import urllib.request
import re
import json

def scrape_jiomart_product():
    url = 'https://www.jiomart.com/c/groceries/snacks-branded-foods/10'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            # Extract product URLs
            product_urls = re.findall(r'href="(/p/groceries/[^"]+)"', html)
            if not product_urls:
                print("No product URLs found")
                return
            
            # Remove duplicates
            product_urls = list(set(product_urls))
            print(f"Found {len(product_urls)} product URLs. Testing the first one...")
            
            # Fetch the first product page
            test_url = 'https://www.jiomart.com' + product_urls[0]
            print(f"Fetching: {test_url}")
            
            req2 = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req2, timeout=10) as res2:
                prod_html = res2.read().decode('utf-8')
                
                # Try to find FSSAI
                fssai = re.search(r'FSSAI.*?(\d{14})', prod_html, re.IGNORECASE)
                print(f"FSSAI Number Found: {fssai.group(1) if fssai else 'None'}")
                
                # Try to find Barcode/Article Number
                # Usually JioMart stores barcode or article number in a table or script tag
                article_no = re.search(r'Article No.*?(\d+)', prod_html, re.IGNORECASE)
                print(f"Article/Barcode Found: {article_no.group(1) if article_no else 'None'}")
                
    except Exception as e:
        print('Error:', e)

if __name__ == "__main__":
    scrape_jiomart_product()
