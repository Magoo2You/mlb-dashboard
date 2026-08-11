import re

# Read lore file  
with open('C:/HermesMLBDASHBOARD/src/data/baseball-lore-expanded.ts', 'r') as f:
    content = f.read()

print(f"Original file size: {len(content)}")

# Pattern to match an item from start brace to end brace, looking for where statBadge is
pattern = r'(\{\s*id:[^}]+statBadge:\s*"[^"]+"\s*\n)'

def add_statcolor(match):
    item_start = match.group(1)
    
    # Find content after this item's start until the closing brace
    text_after = content[content.find(item_start)+len(item_start):]
    
    # Find where we should insert statColor (before fact or whimsy)
    insert_point = len(text_after)
    for j, char in enumerate(text_after[:500]):
        if char == 'fact:' or char == 'whimsy:':
            insert_point = j + 6  # Skip to after the colon
            break
    
    statcolor_line = "    statColor: 'bg-purple-500/90 border-purple-400 text-purple-100',\n"
    
    if insert_point < len(text_after) and 'statColor' not in text_after[insert_point-200:]:
        return item_start + statcolor_line + text_after[:insert_point] + text_after[insert_point:]
    else:
        return match.group(0)

# Apply the regex substitution
modified_content = re.sub(pattern, add_statcolor, content, flags=re.DOTALL)

print(f"Modified file size: {len(modified_content)}")

# Write modified content back  
with open('C:/HermesMLBDASHBOARD/src/data/baseball-lore-expanded.ts', 'w') as f:
    f.write(modified_content)

print("✓ File written successfully")
