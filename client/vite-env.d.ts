/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Добавьте другие публичные переменные по мере необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}