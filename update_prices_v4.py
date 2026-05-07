import json
import re
import sys

def update_prices_from_text(text, json_path, table_name):
    # Regex to match: code, description, unit, price
    # Example: 5456.999A9A.4	TINTA LIMPEZA TOTAL - BL 18,0 LTS	BL	 R$ 736,92
    pattern = re.compile(r'([\w\.]+)\t(.*?)\t(GL|BL|SC|GA|PT|LL|LM|GP|CX|BR|UN|LT|KG)\t\s*R\$\s*([\d\.,]+)')
    
    updates = []
    for match in pattern.finditer(text):
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
        # Try a more flexible regex if the first one fails (e.g. spaces instead of tabs)
        pattern = re.compile(r'([\w\.]+)\s+(.*?)\s+(GL|BL|SC|GA|PT|LL|LM|GP|CX|BR|UN|LT|KG)\s+R\$\s+([\d\.,]+)')
        for match in pattern.finditer(text):
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
    # Since we want to update/add items for a specific table
    table_products = {p['code']: p for p in products if p.get('table') == table_name}
    
    # We also might want to infer categories for new products based on description or other items with same code
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
            # Try to infer category from description if not found
            if category == "Outros":
                desc_lower = update['description'].lower()
                if "tinta" in desc_lower: category = "Tintas"
                elif "massa" in desc_lower: category = "Complementos"
                elif "c.lusso" in desc_lower: category = "Casa Lusso"
                elif "verniz" in desc_lower: category = "Vernizes"
                elif "textura" in desc_lower: category = "Texturas"
            
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
