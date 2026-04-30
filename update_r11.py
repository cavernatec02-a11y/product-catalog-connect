import json
import re

def clean_price(p):
    try:
        # Remove thousands separator (dot) and replace decimal separator (comma) with dot
        p = p.replace('.', '').replace(',', '.')
        return float(p)
    except:
        return None

# The text provided by the user (I'll read it from stdin or a file)
# Since the text is huge, I'll read from a temporary file.

def update_prices(input_text, json_path):
    # Regex to find code and price
    # Supports formats like: 
    # 5002.003A0A.0 ... R$ 87,89
    # 7901.000031 ... R$ 360,80
    # 8807.000010.8 ... R$ 409,57
    
    # We want to be greedy but stop at the next code or end of line if possible.
    # Actually, matching (code) then anything non-greedy until (R$ price) works well.
    pattern = re.compile(r'(\d{4}(?:\.[0-9A-Z]{6}\.[0-9A-Z\d]|\.\d{6}(?:\.\d)?)?)\s+.*?R\$\s+([\d\.,]+)')
    
    updates = {}
    for match in pattern.finditer(input_text):
        code = match.group(1)
        price_str = match.group(2)
        price = clean_price(price_str)
        if price is not None:
            # If code already exists, we might want to check which one to keep.
            # Usually, the list is sequential, so the last occurrence might be better or they might be different variants.
            # But the user message has some duplicates like 5370.B70001.0 with 65,65 and then 64,71.
            updates[code] = price

    print(f"Parsed {len(updates)} unique codes from input.")

    with open(json_path, 'r') as f:
        products = json.load(f)

    updated_count = 0
    for p in products:
        if p.get('table') == 'R11':
            code = p.get('code')
            if code in updates:
                p['price'] = updates[code]
                updated_count += 1

    with open(json_path, 'w') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated_count} products in R11 table.")

if __name__ == "__main__":
    import sys
    with open('r11_text.txt', 'r') as f:
        text = f.read()
    update_prices(text, 'src/data/products.json')
