(function(){"use strict";const h=["typing_extensions-4.7.1-py3-none-any.whl","pydantic-1.10.7-py3-none-any.whl","PyYAML-6.0.1-cp311-cp311-emscripten_3_1_46_wasm32.whl","python_dotenv-1.0.1-py3-none-any.whl","pypdf-6.9.1-py3-none-any.whl","charset_normalizer-3.4.6-py3-none-any.whl"],w=`
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
`,f=(()=>{const t=self.location.href,e=t.indexOf("/assets/");return t.substring(0,e)})();console.log("[Worker] Script loaded at "+new Date().toISOString());let s=null;const u=new Map;let k=0,l=Promise.resolve();const o=t=>self.postMessage(t),m=(t,e)=>{console.error(`[Worker ERROR] ${e}`),o({id:"log",type:"log",level:t,message:`[Worker] ${e.substring(0,2e3)}`})};self.executeSqlAsync=(t,e)=>new Promise((a,i)=>{const r=`sql_${++k}_${Date.now()}`;u.set(r,{resolve:a,reject:i});const p=e?.toJs?e.toJs():e;o({id:r,type:"sql",query:t,params:p})});async function g(){try{const t=performance.now();self.startInitTime=t,self.getPerformanceNow=()=>performance.now(),o({id:"init",type:"status",status:"loading",detail:"Ressources..."});const e=fetch(`${f}/backend.zip`),a=h.map(n=>fetch(`${f}/pyodide/${n}`));self.postPythonStatus=n=>o({id:"init",type:"status",status:"loading",detail:n}),self.postPythonLog=(n,c)=>o({id:"log",type:"log",level:n,message:`[Python] ${c}`}),s=await(await new Function("url","return import(url)").call(null,`${f}/pyodide/pyodide.mjs`)).loadPyodide({indexURL:`${f}/pyodide/`,stdout:n=>console.log(`[STDOUT] ${n}`)}),s.FS.analyzePath("/backend").exists||s.FS.mkdir("/backend"),s.FS.mount(s.FS.filesystems.IDBFS,{},"/backend"),await new Promise((n,c)=>s.FS.syncfs(!0,y=>y?c(y):n()));const r=await(await e).arrayBuffer(),p=r.byteLength.toString();let d="";try{s.FS.analyzePath("/backend/.version").exists&&(d=s.FS.readFile("/backend/.version",{encoding:"utf8"}))}catch{}(d!==p||!s.FS.analyzePath("/backend/api").exists)&&(o({id:"init",type:"status",status:"loading",detail:"Mise à jour..."}),s.unpackArchive(r,"zip",{extractDir:"/backend"}),s.FS.writeFile("/backend/.version",p),s.FS.analyzePath("/backend/site-packages").exists||s.FS.mkdir("/backend/site-packages"),await Promise.all(a.map(async n=>{const c=await(await n).arrayBuffer();s.unpackArchive(c,"zip",{extractDir:"/backend/site-packages"})})),await new Promise((n,c)=>s.FS.syncfs(!1,y=>y?c(y):n()))),await s.runPythonAsync(w),o({id:"init",type:"status",status:"ready"})}catch(t){m("error",`Init failed: ${t}`),o({id:"init",type:"status",status:"error"})}}async function _(t,e){try{const a=await s.runPythonAsync(e);o({id:t,type:"result",data:a?.toJs?a.toJs({dict_converter:Object.fromEntries}):a})}catch(a){o({id:t,type:"error",error:`${a}`})}}async function P(t,e,a=[]){try{const i=`import json, sys
api = sys.modules.get('api_entry') or __import__('main_backend')
await getattr(api, "${e}")(*json.loads(${JSON.stringify(JSON.stringify(a))}))`,r=await s.runPythonAsync(i);o({id:t,type:"result",data:r?.toJs?r.toJs({dict_converter:Object.fromEntries}):r})}catch(i){o({id:t,type:"error",error:`${i}`})}}self.onmessage=async t=>{const{id:e,type:a,code:i,function:r,args:p}=t.data;switch(a){case"init":l=l.then(()=>g());break;case"run":i&&(l=l.then(()=>_(e,i)));break;case"call":r&&(l=l.then(()=>P(e,r,p)));break;case"sql_result":const d=u.get(e);d&&(u.delete(e),t.data.error?d.reject(new Error(t.data.error)):d.resolve(t.data.results||[]));break}}})();
