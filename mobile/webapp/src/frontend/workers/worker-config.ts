// webapp/src/frontend/workers/worker-config.ts

export const WHEELS = [
    "typing_extensions-4.7.1-py3-none-any.whl",
    "pydantic-1.10.7-py3-none-any.whl",
    "PyYAML-6.0.1-cp311-cp311-emscripten_3_1_46_wasm32.whl",
    "python_dotenv-1.0.1-py3-none-any.whl",
    "pypdf-6.9.1-py3-none-any.whl",
    "charset_normalizer-3.4.6-py3-none-any.whl"
];

export const BOOTSTRAP_PYTHON = `
import sys, os, time
from js import self as worker_self

def post_status(detail):
    if hasattr(worker_self, "postPythonStatus"):
        worker_self.postPythonStatus(detail)

post_status("Imports Python...")
for path in ['/backend', '/backend/site-packages']:
    if path not in sys.path: sys.path.insert(0, path)

class JsOutput:
    def write(self, s):
        if s.strip(): worker_self.postPythonLog("info", s.strip())
    def flush(self): pass

sys.stdout = sys.stderr = JsOutput()
os.environ['PYODIDE_MODE'] = '1'

async def bootstrap():
    try:
        import main_backend
        sys.modules['api_entry'] = main_backend
        worker_self.postPythonLog("info", "Executing initialize_backend()...")
        await main_backend.initialize_backend()
    except Exception as e:
        import traceback
        traceback.print_exc()
        worker_self.postPythonLog("error", f"Bootstrap failed: {e}")
    worker_self.postPythonLog("info", f"Initialization finished in {(worker_self.getPerformanceNow() - worker_self.startInitTime):.2f}ms")

import asyncio
# Top-level await is supported in runPythonAsync
# This ensures runPythonAsync only returns when bootstrap is DONE
await bootstrap()
`;
