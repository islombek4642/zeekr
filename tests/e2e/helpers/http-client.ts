import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildNextRequest } from './auth-helper';
import { importOptionalModule } from './module-loader';
import { NextNotFoundError, NextRedirectError } from './next-mocks';

export interface HttpResponseResult {
  status: number;
  headers: Headers;
  location?: string | null;
  json?: any;
  text: string;
}

export interface PageRenderResult {
  status: number;
  html: string;
  redirectedTo?: string;
}

export function getE2EBaseUrl(): string | null {
  return process.env.E2E_BASE_URL ? process.env.E2E_BASE_URL.replace(/\/+$/, '') : null;
}

export async function callMiddleware(
  pathname: string,
  options: {
    token?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
): Promise<HttpResponseResult> {
  const baseUrl = getE2EBaseUrl();
  if (baseUrl) {
    const headers: Record<string, string> = { ...(options.headers || {}) };
    const cookiePairs: string[] = [];
    if (options.token) cookiePairs.push(`admin_token=${options.token}`);
    if (options.cookies) {
      for (const [k, v] of Object.entries(options.cookies)) cookiePairs.push(`${k}=${v}`);
    }
    if (cookiePairs.length > 0) headers.cookie = cookiePairs.join('; ');
    const res = await fetch(`${baseUrl}${pathname}`, { redirect: 'manual', headers });
    const text = await res.text();
    return { status: res.status, headers: res.headers, location: res.headers.get('location'), text };
  }

  const mod = await importOptionalModule<{ middleware: (req: any) => Promise<Response> | Response }>(
    'src/middleware.ts'
  );
  if (!mod || typeof mod.middleware !== 'function') {
    throw new Error('src/middleware.ts does not export middleware()');
  }
  const req = buildNextRequest(pathname, options);
  const res = await mod.middleware(req);
  const text = await res.text();
  return {
    status: res.status,
    headers: res.headers,
    location: res.headers.get('location'),
    text,
  };
}

export async function dispatchApiRequest(
  apiPath: string,
  routeModulePath: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    rawBody?: string;
    formData?: FormData;
    token?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
): Promise<HttpResponseResult> {
  const method = options.method || 'POST';
  const baseUrl = getE2EBaseUrl();

  if (baseUrl) {
    const headers: Record<string, string> = { ...(options.headers || {}) };
    const cookiePairs: string[] = [];
    if (options.token) cookiePairs.push(`admin_token=${options.token}`);
    if (options.cookies) {
      for (const [k, v] of Object.entries(options.cookies)) cookiePairs.push(`${k}=${v}`);
    }
    if (cookiePairs.length > 0) headers.cookie = cookiePairs.join('; ');

    let body: BodyInit | undefined;
    if (options.formData) {
      body = options.formData;
    } else if (options.rawBody !== undefined) {
      body = options.rawBody;
      headers['content-type'] = headers['content-type'] || 'application/json';
    } else if (options.body !== undefined) {
      body = JSON.stringify(options.body);
      headers['content-type'] = headers['content-type'] || 'application/json';
    }

    const res = await fetch(`${baseUrl}${apiPath}`, {
      method,
      headers,
      body,
      redirect: 'manual',
    });
    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    return { status: res.status, headers: res.headers, location: res.headers.get('location'), json, text };
  }

  const mod = await importOptionalModule<Record<string, (req: any) => Promise<Response>>>(routeModulePath);
  if (!mod || typeof mod[method] !== 'function') {
    return {
      status: 404,
      headers: new Headers(),
      json: { error: `Route module missing or method ${method} not exported: ${routeModulePath}` },
      text: `Not Found: ${routeModulePath}`,
    };
  }

  const headers = new Headers(options.headers || {});
  let body: BodyInit | null = null;
  if (options.formData) {
    body = options.formData;
  } else if (options.rawBody !== undefined) {
    body = options.rawBody;
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  }

  const req = buildNextRequest(apiPath, {
    method,
    token: options.token,
    cookies: options.cookies,
    headers: Object.fromEntries(headers.entries()),
    body,
  });

  const res = await mod[method](req);
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return {
    status: res.status,
    headers: res.headers,
    location: res.headers.get('location'),
    json,
    text,
  };
}

export async function renderServerPage(
  pageModulePath: string,
  props: Record<string, any> = {},
  options: { withRootLayout?: boolean } = {}
): Promise<PageRenderResult> {
  const mod = await importOptionalModule<{ default?: React.ComponentType<any> }>(pageModulePath);
  if (!mod || typeof mod.default !== 'function') {
    return { status: 404, html: '' };
  }

  try {
    const PageComponent = mod.default as (p: any) => Promise<React.ReactElement> | React.ReactElement;
    let element = await PageComponent(props);

    if (options.withRootLayout) {
      const rootMod = await importOptionalModule<{ default?: React.ComponentType<any> }>('src/app/layout.tsx');
      if (rootMod && typeof rootMod.default === 'function') {
        const RootLayout = rootMod.default as (p: any) => Promise<React.ReactElement> | React.ReactElement;
        element = await RootLayout({ children: element });
      }
    }

    const html = renderToStaticMarkup(element);
    return { status: 200, html };
  } catch (err: any) {
    if (err instanceof NextNotFoundError || err?.message === 'NEXT_NOT_FOUND' || err?.digest?.includes('404')) {
      return { status: 404, html: '' };
    }
    if (err instanceof NextRedirectError || err?.message?.startsWith('NEXT_REDIRECT:')) {
      return {
        status: 307,
        html: '',
        redirectedTo: err.url || String(err.message).replace('NEXT_REDIRECT:', ''),
      };
    }
    throw err;
  }
}

export function renderComponentHtml(element: React.ReactElement): string {
  return renderToStaticMarkup(element);
}
