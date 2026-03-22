import os
import re

def count_hanzi_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return len(re.findall(r'[\u4e00-\u9fff]', content))

def main(folder):
    total = 0
    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith('.md') |file.endswith('.txt'):
                filepath = os.path.join(root, file)
                total += count_hanzi_in_file(filepath)
    print(f'总汉字数：{total}')

if __name__ == '__main__':
    import sys
    folder = sys.argv[1] if len(sys.argv) > 1 else '.'
    main(folder)