/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_DESCRIPTION: string
    readonly VITE_APP_VERSION: string
    readonly VITE_DEV_MODE: string
    readonly VITE_DEBUG: string
    readonly VITE_API_TIMEOUT: string
    readonly VITE_API_RETRY_COUNT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}