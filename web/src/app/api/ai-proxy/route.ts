import { isIP } from "node:net";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AI_PROXY_TIMEOUT_MS = 120000;
const AI_PROXY_MAX_BODY_BYTES = 80 * 1024 * 1024;
const AI_PROXY_TARGET_HEADER = "x-ai-target";

export async function GET(request: NextRequest) {
    return proxyAiRequest(request);
}

export async function POST(request: NextRequest) {
    return proxyAiRequest(request);
}

async function proxyAiRequest(request: NextRequest) {
    const method = request.method.toUpperCase();
    if (method !== "GET" && method !== "POST") return new Response("Unsupported AI proxy method", { status: 405 });
    const target = request.headers.get(AI_PROXY_TARGET_HEADER) || "";
    const targetUrl = parseSafeTarget(target);
    if (typeof targetUrl === "string") return new Response(targetUrl, { status: 400 });

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > AI_PROXY_MAX_BODY_BYTES) return new Response("AI proxy body too large", { status: 413 });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_PROXY_TIMEOUT_MS);
    try {
        const body = method === "GET" ? undefined : await request.arrayBuffer();
        if (body && body.byteLength > AI_PROXY_MAX_BODY_BYTES) return new Response("AI proxy body too large", { status: 413 });
        const response = await fetch(targetUrl, {
            method,
            headers: proxyHeaders(request),
            body: body?.byteLength ? body : undefined,
            signal: controller.signal,
        });
        return new Response(method === "GET" ? response.body : response.body, {
            status: response.status,
            headers: responseHeaders(response.headers, targetUrl, response.status),
        });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return new Response("AI proxy timeout", { status: 504 });
        return new Response(error instanceof Error ? error.message : "AI proxy error", { status: 502 });
    } finally {
        clearTimeout(timer);
    }
}

function parseSafeTarget(target: string) {
    if (!target) return "Missing x-ai-target";
    let url: URL;
    try {
        url = new URL(target);
    } catch {
        return "Invalid x-ai-target";
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return "Unsupported AI proxy target";
    if (url.username || url.password) return "AI proxy target must not include credentials";
    if (isBlockedHost(url.hostname)) return "AI proxy target host is not allowed";
    return url;
}

function isBlockedHost(hostname: string) {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
    const ipVersion = isIP(host);
    if (!ipVersion) return false;
    if (ipVersion === 6) return host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
    const parts = host.split(".").map(Number);
    const [a, b] = parts;
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function proxyHeaders(request: NextRequest) {
    const headers = new Headers();
    copyHeader(request, headers, "authorization", "Authorization");
    copyHeader(request, headers, "content-type", "Content-Type");
    copyHeader(request, headers, "accept", "Accept");
    copyHeader(request, headers, "x-goog-api-key", "x-goog-api-key");
    return headers;
}

function copyHeader(request: NextRequest, headers: Headers, from: string, to: string) {
    const value = request.headers.get(from);
    if (value) headers.set(to, value);
}

function responseHeaders(headers: Headers, target: URL, status: number) {
    const result = new Headers();
    ["content-type", "cache-control"].forEach((key) => {
        const value = headers.get(key);
        if (value) result.set(key, value);
    });
    result.set("x-ai-proxy-target-host", target.host);
    result.set("x-ai-proxy-upstream-status", String(status));
    return result;
}
