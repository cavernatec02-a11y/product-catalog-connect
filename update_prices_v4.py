import json
import re
import sys

def update_prices_from_text(text, json_path, table_name):
    # Regex to match: code, description, unit, price
    # Example: 9505.0102	EXPOSITOR CLASSIC CRISTAL 863.0 ACRIMET	UN	 R$ 182,26
    # Units seen: UN, GL, BL, SC, FR, GP, QT, BR, LM, PT, LL, GA, CX, LT, KG, MT
    units_pattern = r'GL|BL|SC|GA|PT|LL|LM|GP|CX|BR|UN|LT|KG|FR|QT|MT'
    
    # Try tab-separated first
    pattern_tab = re.compile(r'([\w\.]+)\t(.*?)\t(' + units_pattern + r')\t\s*R\$\s*([\d\.,]+)')
    # Try space-separated (more than 1 space or specific sequence)
    pattern_space = re.compile(r'([\w\.]+)\s+(.*?)\s+(' + units_pattern + r')\s+R\$\s+([\d\.,]+)')
    
    updates = []
    
    # Check if text has tabs
    if '\t' in text:
        for match in pattern_tab.finditer(text):
            code = match.group(1).strip()
            description = match.group(2).strip()
            unit = match.group(3).strip()
            price_str = match.group(4).replace('.', '').replace(',', '.')
            try:
                price = float(price_str)
                updates.append({
                    'code': code,
                    'description': description,
                    'unit': unit,
                    'price': price
                })
            except ValueError:
                continue
    
    # If no updates or to catch mixed, try space pattern
    if not updates:
        for match in pattern_space.finditer(text):
            code = match.group(1).strip()
            description = match.group(2).strip()
            unit = match.group(3).strip()
            price_str = match.group(4).replace('.', '').replace(',', '.')
            try:
                price = float(price_str)
                updates.append({
                    'code': code,
                    'description': description,
                    'unit': unit,
                    'price': price
                })
            except ValueError:
                continue

    if not updates:
        print("No updates found in text.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Create a mapping of (code, table) -> product
    table_products = {p['code']: p for p in products if p.get('table') == table_name}
    
    # Mapping for category inference
    all_codes_categories = {p['code']: p['category'] for p in products if 'category' in p}

    updated_count = 0
    added_count = 0
    
    for update in updates:
        code = update['code']
        if code in table_products:
            table_products[code]['price'] = update['price']
            table_products[code]['description'] = update['description']
            table_products[code]['unit'] = update['unit']
            updated_count += 1
        else:
            # Add new product for this table
            category = all_codes_categories.get(code, "Outros")
            if category == "Outros":
                desc_lower = update['description'].lower()
                if "tinta" in desc_lower: category = "Tintas"
                elif "massa" in desc_lower: category = "Complementos"
                elif "c.lusso" in desc_lower: category = "Casa Lusso"
                elif "verniz" in desc_lower: category = "Vernizes"
                elif "textura" in desc_lower: category = "Texturas"
                elif "pig" in desc_lower: category = "Outros" # Could be Pigmentos
                elif "selador" in desc_lower: category = "Complementos"
            
            new_product = {
                "code": code,
                "description": update['description'],
                "unit": update['unit'],
                "price": update['price'],
                "category": category,
                "table": table_name
            }
            products.append(new_product)
            table_products[code] = new_product
            added_count += 1
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"Table {table_name}: Updated {updated_count} prices, Added {added_count} new products.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_prices.py <table_name>")
        sys.exit(1)
    
    table_name = sys.argv[1]
    text = sys.stdin.read()
    update_prices_from_text(text, 'src/data/products.json', table_name)
