import json
import re

def clean_price(p):
    try:
        # Remove thousands separator (dot) and replace decimal separator (comma) with dot
        p = p.replace('.', '').replace(',', '.')
        return float(p)
    except:
        return None

def update_prices(input_text, json_path):
    # Updated regex to be more robust
    # Matches: Code [space] Description [space] Unit [space] R$ [space] Price
    # Example: 5002.003A0A.0 ARCADIA FIXA-SIL - G.P. 3,6 LTS GL R$ 87,89
    pattern = re.compile(r'(\d{4}\.[0-9A-Z]{6}\.[0-9A-Z\d]|\d{4}\.\d{6}\.\d|\d{4}\.\d{6})\s+.*?R\$\s+([\d\.,]+)')
    
    updates = {}
    for match in pattern.finditer(input_text):
        code = match.group(1)
        price_str = match.group(2)
        price = clean_price(price_str)
        if price is not None:
            # The list might have duplicates, we keep the last one or consistent one
            updates[code] = price

    print(f"Parsed {len(updates)} unique codes from input.")

    with open(json_path, 'r') as f:
        products = json.load(f)

    updated_count = 0
    found_codes = set()
    for p in products:
        if p.get('table') == 'R11' or p.get('table') is None: # Default table is R11
            code = p.get('code')
            if code in updates:
                p['price'] = updates[code]
                updated_count += 1
                found_codes.add(code)

    with open(json_path, 'w') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated_count} products in src/data/products.json.")
    print(f"Unique codes updated: {len(found_codes)}")

if __name__ == "__main__":
    import sys
    # Read text from stdin to avoid file issues
    text = sys.stdin.read()
    update_prices(text, 'src/data/products.json')
