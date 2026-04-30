import json
import re
import sys

def clean_price(p):
    try:
        # Remove thousands separator (dot) and replace decimal separator (comma) with dot
        p = p.replace('.', '').replace(',', '.')
        return float(p)
    except Exception as e:
        return None

def update_prices(input_text, json_path):
    # Matches: Code [space] Description [space] Unit [space] R$ [space] Price
    # Example: 5002.003A0A.0 ARCADIA FIXA-SIL - G.P. 3,6 LTS GL R$ 87,89
    # Supports different code formats: 5002.003A0A.0, 5370.B70001.0, 8721.000050.K
    pattern = re.compile(r'(\d{4}\.[0-9A-Z]{6}\.[0-9A-Z\d]|\d{4}\.[0-9A-Z]\d{5}\.\d|\d{4}\.\d{6})\s+.*?R\$\s+([\d\.,]+)')
    
    updates = {}
    for match in pattern.finditer(input_text):
        code = match.group(1)
        price_str = match.group(2)
        price = clean_price(price_str)
        if price is not None:
            updates[code] = price

    print(f"Parsed {len(updates)} unique codes from input.")

    try:
        with open(json_path, 'r') as f:
            products = json.load(f)
    except FileNotFoundError:
        print(f"Error: {json_path} not found.")
        return

    updated_count = 0
    found_codes = set()
    for p in products:
        # Update if it belongs to R11 or has no table specified (default)
        if p.get('table') == 'R11' or p.get('table') is None:
            code = p.get('code')
            if code in updates:
                p['price'] = updates[code]
                updated_count += 1
                found_codes.add(code)

    with open(json_path, 'w') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated_count} products in {json_path}.")
    print(f"Unique codes updated: {len(found_codes)}")

if __name__ == "__main__":
    # We will pass the text via a temporary file to avoid command line length limits
    if len(sys.argv) < 2:
        print("Usage: python3 update_script.py <input_text_file>")
        sys.exit(1)
        
    with open(sys.argv[1], 'r') as f:
        text = f.read()
    update_prices(text, 'src/data/products.json')
