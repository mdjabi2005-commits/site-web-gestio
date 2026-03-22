(function(){"use strict";const u=["typing_extensions-4.7.1-py3-none-any.whl","pydantic-1.10.7-py3-none-any.whl","PyYAML-6.0.1-cp311-cp311-emscripten_3_1_46_wasm32.whl","python_dotenv-1.0.1-py3-none-any.whl","pypdf-6.9.1-py3-none-any.whl","charset_normalizer-3.4.6-py3-none-any.whl"],h=`
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
`;console.log("[Worker] Script loaded at "+new Date().toISOString());let e=null;const f=new Map;let w=0,l=Promise.resolve();const o=t=>self.postMessage(t),k=(t,s)=>{console.error(`[Worker ERROR] ${s}`),o({id:"log",type:"log",level:t,message:`[Worker] ${s.substring(0,2e3)}`})};self.executeSqlAsync=(t,s)=>new Promise((a,r)=>{const i=`sql_${++w}_${Date.now()}`;f.set(i,{resolve:a,reject:r});const p=s?.toJs?s.toJs():s;o({id:i,type:"sql",query:t,params:p})});async function m(){try{const t=performance.now();self.startInitTime=t,self.getPerformanceNow=()=>performance.now(),o({id:"init",type:"status",status:"loading",detail:"Ressources..."});const s=fetch("/backend.zip"),a=u.map(n=>fetch(`/pyodide/${n}`));self.postPythonStatus=n=>o({id:"init",type:"status",status:"loading",detail:n}),self.postPythonLog=(n,c)=>o({id:"log",type:"log",level:n,message:`[Python] ${c}`}),e=await(await new Function("url","return import(url)").call(null,"/pyodide/pyodide.mjs")).loadPyodide({indexURL:"/pyodide/",stdout:n=>console.log(`[STDOUT] ${n}`)}),e.FS.analyzePath("/backend").exists||e.FS.mkdir("/backend"),e.FS.mount(e.FS.filesystems.IDBFS,{},"/backend"),await new Promise((n,c)=>e.FS.syncfs(!0,d=>d?c(d):n()));const i=await(await s).arrayBuffer(),p=i.byteLength.toString();let y="";try{e.FS.analyzePath("/backend/.version").exists&&(y=e.FS.readFile("/backend/.version",{encoding:"utf8"}))}catch{}(y!==p||!e.FS.analyzePath("/backend/api").exists)&&(o({id:"init",type:"status",status:"loading",detail:"Mise à jour..."}),e.unpackArchive(i,"zip",{extractDir:"/backend"}),e.FS.writeFile("/backend/.version",p),e.FS.analyzePath("/backend/site-packages").exists||e.FS.mkdir("/backend/site-packages"),await Promise.all(a.map(async n=>{const c=await(await n).arrayBuffer();e.unpackArchive(c,"zip",{extractDir:"/backend/site-packages"})})),await new Promise((n,c)=>e.FS.syncfs(!1,d=>d?c(d):n()))),await e.runPythonAsync(h),o({id:"init",type:"status",status:"ready"})}catch(t){k("error",`Init failed: ${t}`),o({id:"init",type:"status",status:"error"})}}async function g(t,s){try{const a=await e.runPythonAsync(s);o({id:t,type:"result",data:a?.toJs?a.toJs({dict_converter:Object.fromEntries}):a})}catch(a){o({id:t,type:"error",error:`${a}`})}}async function _(t,s,a=[]){try{const r=`import json, sys
api = sys.modules.get('api_entry') or __import__('main_backend')
await getattr(api, "${s}")(*json.loads(${JSON.stringify(JSON.stringify(a))}))`,i=await e.runPythonAsync(r);o({id:t,type:"result",data:i?.toJs?i.toJs({dict_converter:Object.fromEntries}):i})}catch(r){o({id:t,type:"error",error:`${r}`})}}self.onmessage=async t=>{const{id:s,type:a,code:r,function:i,args:p}=t.data;switch(a){case"init":l=l.then(()=>m());break;case"run":r&&(l=l.then(()=>g(s,r)));break;case"call":i&&(l=l.then(()=>_(s,i,p)));break;case"sql_result":const y=f.get(s);y&&(f.delete(s),t.data.error?y.reject(new Error(t.data.error)):y.resolve(t.data.results||[]));break}}})();
