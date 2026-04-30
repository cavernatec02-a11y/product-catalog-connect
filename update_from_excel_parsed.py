import json
import re
import sys

def clean_price(p):
    if not p:
        return None
    # Remove everything except digits, comma and dot
    # Sometimes it's like "R$ 87,89" or has Excel formatting leftovers
    p = re.sub(r'[^\d,\.]', '', p)
    if not p:
        return None
    try:
        # If there's a comma and a dot, it might be 1.234,56
        if ',' in p and '.' in p:
            p = p.replace('.', '').replace(',', '.')
        elif ',' in p:
            p = p.replace(',', '.')
        return float(p)
    except Exception:
        return None

def update_from_html(html_text, json_path):
    # This regex looks for <tr> with multiple <td>
    # We expect 4 cells: Code, Description, Unit, Price
    # Using re.DOTALL to handle multiline tags if any
    tr_pattern = re.compile(r'<tr>(.*?)</tr>', re.DOTALL)
    td_pattern = re.compile(r'<td[^>]*>(.*?)</td>', re.DOTALL)
    
    updates = {}
    
    for tr_match in tr_pattern.finditer(html_text):
        tr_content = tr_match.group(1)
        td_matches = td_pattern.findall(tr_content)
        
        if len(td_matches) >= 4:
            code = td_matches[0].strip()
            # Basic validation of code format (e.g. 5002.003A0A.0 or 8721.000050.K)
            if re.match(r'^\d{4}\.[0-9A-Z]{6}\.[0-9A-Z\d]$|^\d{4}\.\d{6}$|^\d{4}\.\d{6}\.\d$', code):
                price_str = td_matches[3].strip()
                price = clean_price(price_str)
                if price is not None:
                    updates[code] = price
    
    print(f"Parsed {len(updates)} unique codes from HTML.")
    
    if not updates:
        print("No valid updates found. Check HTML structure.")
        return

    try:
        with open(json_path, 'r') as f:
            products = json.load(f)
    except FileNotFoundError:
        print(f"Error: {json_path} not found.")
        return

    updated_count = 0
    found_codes = set()
    for p in products:
        # We update R11 by default if not specified, but let's be flexible
        # If the code matches, we update it regardless of the table in JSON?
        # Better to keep it scoped to R11 if that's what was asked, but the user might want G10 too.
        # Let's check if the HTML text contains "G10" or "R11" headings.
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
    if len(sys.argv) < 2:
        print("Usage: python3 update_script.py <input_html_file>")
        sys.exit(1)
        
    with open(sys.argv[1], 'r') as f:
        text = f.read()
    update_from_html(text, 'src/data/products.json')
