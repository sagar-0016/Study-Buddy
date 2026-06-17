declare module '@postlight/parser' {
  interface Parser {
    parse(
      url: string,
      options?: {
        contentType?: 'html' | 'markdown' | 'text';
        headers?: Record<string, string>;
        html?: string;
      }
    ): Promise<ParseResult>;
  }

  interface ParseResult {
    title: string | null;
    content: string | null;
    author: string | null;
    date_published: string | null;
    lead_image_url: string | null;
    dek: string | null;
    next_page_url: string | null;
    url: string;
    domain: string;
    excerpt: string | null;
    word_count: number;
    direction: 'ltr' | 'rtl';
    total_pages: number;
    rendered_pages: number;
  }

  const ParserInstance: Parser;
  export = ParserInstance;
}

declare module 'react-pdf' {
    export const Document: React.ComponentType<any>;
    export const Page: React.ComponentType<any>;
    export const pdfjs: any;
}
