import json
import re
import sys

def update_prices_from_text(text, json_path):
    # Regex to match product codes like 8506.000000.4, 9501.0139, D2021.003.1.4
    # and prices like R$ 264,14 or R$ 1.172
    pattern = re.compile(r'([A-Z0-9][A-Z0-9\.]+)\s+.*?\s+(?:GL|BL|SC|GA|PT|LL|LM|GP|CX|BR|UN|LT|KG)\s+R\$\s+([\d\.,]+)', re.MULTILINE)
    
    updates = {}
    for match in pattern.finditer(text):
        code = match.group(1)
        price_raw = match.group(2)
        
        # Price cleaning
        if ',' in price_raw:
            # e.g. "264,14" or "1.350,22"
            price_str = price_raw.replace('.', '').replace(',', '.')
        else:
            # e.g. "1.172" or "2.682" (likely thousands) or "72.00" (if it was USD, but here R$)
            # In this context, "1.172" usually means 1172.00
            price_str = price_raw.replace('.', '')
            
        try:
            updates[code] = float(price_str)
        except ValueError:
            continue

    if not updates:
        print("No updates found in text.")
        return

    try:
        with open(json_path, 'r') as f:
            products = json.load(f)
    except FileNotFoundError:
        print(f"Error: {json_path} not found.")
        return

    updated_count = 0
    for p in products:
        if p.get('code') in updates:
            p['price'] = updates[p['code']]
            updated_count += 1
    
    with open(json_path, 'w') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {updated_count} prices in {json_path}.")

if __name__ == "__main__":
    text = sys.stdin.read()
    update_prices_from_text(text, 'src/data/products.json')
