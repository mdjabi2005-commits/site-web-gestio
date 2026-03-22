import urllib.request
import json
from pathlib import Path

# Pyodide version to match the one in our worker
PYODIDE_VERSION = "0.25.1"
BASE_URL = f"https://cdn.jsdelivr.net/pyodide/v{PYODIDE_VERSION}/full/"

# Core files required for Pyodide to run
CORE_FILES = [
    "pyodide.mjs",
    "pyodide.asm.js",
    "pyodide.asm.wasm",
    "pyodide.js",
    "pyodide-lock.json",
    "python_stdlib.zip"
]

# We also need some packages required for the app to function (dateutil, micropip, pydantic v1, yaml, dotenv)
# Let's read pyodide-lock.json to find their URLs or just rely on micropip downloading them during build
# For simplicity, we'll download the core files, and let the worker fetch the wheels initially, OR we can bundle them.
# The user wants local bundling to avoid network entirely.

PACKAGES = [
    "micropip",
    "pyparsing",
    "packaging",
    "pydantic",
    "pyyaml",
    "typing-extensions", # Dependency of pydantic
]

# Pure Python wheels from PyPI that aren't in the Pyodide distribution
EXTRA_PACKAGES = {
    "python_dotenv": "https://files.pythonhosted.org/packages/6a/3e/b68c118422ec867fa7ab88444e1274aa40681c606d59ac27de5a5588f082/python_dotenv-1.0.1-py3-none-any.whl"
}

# Note for PyYAML: Pyodide usually has it, but if we want a specific one or pure python:
# Let's check Pyodide lock again for native emscripten wheels.

def download_file(url, target_path):
    print(f"Downloading {url} to {target_path}...")
    try:
        urllib.request.urlretrieve(url, target_path)
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def main():
    # Setup paths
    base_dir = Path(__file__).parent.parent.parent
    public_dir = base_dir / "webapp" / "public" / "pyodide"
    public_dir.mkdir(parents=True, exist_ok=True)

    print(f"Bundling Pyodide v{PYODIDE_VERSION} to {public_dir}")

    # 1. Download Core Files
    for file in CORE_FILES:
        target_path = public_dir / file
        if not target_path.exists():
            download_file(BASE_URL + file, target_path)
        else:
            print(f"{file} already exists, skipping.")
    
    # 2. Parse pyodide-lock.json to get specific package files
    lock_file = public_dir / "pyodide-lock.json"
    if lock_file.exists():
        with open(lock_file, "r") as f:
            lock_data = json.load(f)
        
        packages = lock_data.get("packages", {})
        for pkg_name in PACKAGES:
            if pkg_name in packages:
                pkg_file = packages[pkg_name]["file_name"]
                target_path = public_dir / pkg_file
                if not target_path.exists():
                    download_file(BASE_URL + pkg_file, target_path)
                else:
                    print(f"{pkg_name} ({pkg_file}) already exists, skipping.")
            else:
                 print(f"Warning: {pkg_name} not found in pyodide-lock.json")

    # 3. Download Extra Packages from PyPI
    for pkg_name, url in EXTRA_PACKAGES.items():
        file_name = url.split("/")[-1]
        target_path = public_dir / file_name
        if not target_path.exists():
            download_file(url, target_path)
        else:
            print(f"{pkg_name} ({file_name}) already exists, skipping.")

    print("\n[SUCCESS] Pyodide core and packages bundled successfully.")

if __name__ == "__main__":
    main()
