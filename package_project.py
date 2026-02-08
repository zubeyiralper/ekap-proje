import os
import zipfile

# Source Directory
SOURCE_DIR = r"c:\Users\ASUS\Desktop\ekap-malzeme"

# Output Files
ZIP_OUTPUT = r"c:\Users\ASUS\Desktop\EKAP_PROJE_YEDEGI.zip"
TEXT_OUTPUT = r"c:\Users\ASUS\Desktop\EKAP_AI_KOD_OZETI.txt"

# Files to exclude from text summary (too large or binary)
EXCLUDE_FROM_TEXT = [
    "data_2024.js",
    "data_2025.js",
    "data_2025_backup.js",
    "data_2025_prices_temp.js",
    "kgm_raw.txt",
    "package-lock.json",
    ".git",
    "node_modules",
    "fiyatsiz_pozlar_raporu.json",
    "admin_pdf_tool.html" # HTML but too large/complex for simple AI context often
]

def create_zip():
    print(f"Creating ZIP at {ZIP_OUTPUT}...")
    with zipfile.ZipFile(ZIP_OUTPUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(SOURCE_DIR):
            # Exclude node_modules from ZIP
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')
            
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, SOURCE_DIR)
                zipf.write(file_path, rel_path)
    print("ZIP created successfully.")

def create_text_summary():
    print(f"Creating Text Summary at {TEXT_OUTPUT}...")
    with open(TEXT_OUTPUT, 'w', encoding='utf-8') as outfile:
        outfile.write("# EKAP PROJE KOD ÖZETİ\n")
        outfile.write("Bu dosya, projenin önemli kod dosyalarının birleşimidir.\n\n")

        for root, dirs, files in os.walk(SOURCE_DIR):
            # Exclude dirs
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')
            
            for file in files:
                if file in EXCLUDE_FROM_TEXT:
                    continue
                
                # Check extension
                if not file.endswith(('.html', '.js', '.css', '.py', '.json', '.md', '.txt')):
                    continue

                if file.endswith('.txt') and os.path.getsize(os.path.join(root, file)) > 100000: # Skip large txts
                    continue

                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, SOURCE_DIR)
                
                outfile.write(f"\n\n{'='*50}\n")
                outfile.write(f"FILE: {rel_path}\n")
                outfile.write(f"{'='*50}\n\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        if len(content) > 50000: # Truncate very large files even if included
                            outfile.write(content[:50000] + "\n... [TRUNCATED] ...")
                        else:
                            outfile.write(content)
                except Exception as e:
                    outfile.write(f"[Error reading file: {e}]")

    print("Text Summary created successfully.")

if __name__ == "__main__":
    create_zip()
    create_text_summary()
