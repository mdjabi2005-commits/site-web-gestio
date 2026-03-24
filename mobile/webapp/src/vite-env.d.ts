/// <reference types="vite/client" />

declare module "/pyodide/pyodide.mjs" {
    export function loadPyodide(options?: {
        indexURL?: string
        packages?: string[]
    }): Promise<{
        runPythonAsync: (code: string) => Promise<any>
        loadPackagesFromImports: (code: string) => Promise<void>
        loadPackage: (packages: string | string[]) => Promise<void>
        globals: any
        FS: any
        unpackArchive: (buffer: ArrayBuffer, format: string, options?: any) => void
    }>
}


declare module "/pyodide/pyodide.mjs?url" {
    const url: string
    export default url
}
