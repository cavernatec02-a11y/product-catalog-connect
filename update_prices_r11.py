import json
import re
import sys

def update_prices_from_text(text, json_path):
    # Regex to match: code (e.g., 5379.S00020.4), description (ignored), unit (ignored), price (e.g., R$ 592,31)
    # The code format: 4 digits + . + alphanumeric + . + alphanumeric
    # Price format: R$ 592,31 or R$ 1.350,22
    pattern = re.compile(r'(\d{4}\.[A-Z0-9\.]+\d)\s+.*?\s+(?:GL|BL|SC|GA|PT|LL|LM|GP|CX|BR|UN|LT|KG)\s+R\$\s+([\d\.,]+)')
    
    updates = {}
    for match in pattern.finditer(text):
        code = match.group(1)
        price_str = match.group(2).replace('.', '').replace(',', '.')
        try:
            updates[code] = float(price_str)
        except ValueError:
            continue

    if not updates:
        print("No updates found in text.")
        return

    with open(json_path, 'r') as f:
        products = json.load(f)

    updated_count = 0
    for p in products:
        if p.get('code') in updates:
            p['price'] = updates[p['code']]
            updated_count += 1
    
    with open(json_path, 'w') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {updated_count} prices.")

if __name__ == "__main__":
    # Get all text from stdin
    text = sys.stdin.read()
    update_prices_from_text(text, 'src/data/products.json')
