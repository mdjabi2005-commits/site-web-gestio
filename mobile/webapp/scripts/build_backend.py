import os
import zipfile

def build_backend_zip():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    backend_dir = os.path.join(base_dir, "backend")
    output_zip = os.path.join(base_dir, "webapp", "public", "backend.zip")

    folders_to_include = ['api', 'config', 'domains', 'shared']
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Include folders
        for folder in folders_to_include:
            folder_path = os.path.join(backend_dir, folder)
            if not os.path.exists(folder_path):
                continue
                
            for root, _, files in os.walk(folder_path):
                if '__pycache__' in root:
                    continue
                for file in files:
                    file_path = os.path.join(root, file)
                    # Create archive path with normalized forward slashes
                    rel_path = os.path.relpath(file_path, backend_dir).replace('\\', '/')
                    zf.write(file_path, rel_path)
                    
        # Include main entry point
        main_py = os.path.join(backend_dir, "main_backend.py")
        if os.path.exists(main_py):
            zf.write(main_py, "main_backend.py")

if __name__ == "__main__":
    print("Building backend.zip...")
    build_backend_zip()
    print("Done!")
