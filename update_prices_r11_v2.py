import json
import re
import sys

def update_prices_from_text(text, json_path):
    # Updated regex to match prices like R$ 1.172 (no decimals) or R$ 143,33
    pattern = re.compile(r'(\d{4}\.[A-Z0-9\.]+\d)\s+.*?\s+(?:GL|BL|SC|GA|PT|LL|LM|GP|CX|BR|UN|LT|KG)\s+R\$\s+([\d\.,]+)')
    
    updates = {}
    for match in pattern.finditer(text):
        code = match.group(1)
        # Price cleaning: remove thousand separators (.) and replace decimal separator (,) with (.)
        # If there's only one dot and no comma, and it's 4 digits long, it might be a thousand separator.
        # But usually in these lists, "1.172" means 1172.00.
        price_raw = match.group(2)
        if ',' in price_raw:
            price_str = price_raw.replace('.', '').replace(',', '.')
        else:
            # Handle cases like 1.172 or 2.682 (assuming they are thousands)
            price_str = price_raw.replace('.', '')
            
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
    text = sys.stdin.read()
    update_prices_from_text(text, 'src/data/products.json')
