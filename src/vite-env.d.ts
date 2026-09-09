/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "html2pdf.js" {
  interface Html2PdfWorker {
    from(src: HTMLElement | string): Html2PdfWorker;
    to(target: string): Html2PdfWorker;
    toContainer(): Html2PdfWorker;
    toCanvas(): Html2PdfWorker;
    toImg(): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    save(filename?: string): Promise<void>;
    set(options: unknown): Html2PdfWorker;
  }

  function html2pdf(source?: HTMLElement | string, options?: unknown): Html2PdfWorker;
  export default html2pdf;
}
