import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEEDANCE_PROXY_TIMEOUT_MS = 120000;

export async function GET(request: NextRequest) {
    return proxySeedanceRequest(request, "GET");
}

export async function POST(request: NextRequest) {
    return proxySeedanceRequest(request, "POST");
}

async function proxySeedanceRequest(request: NextRequest, method: "GET" | "POST") {
    const target = request.headers.get("x-seedance-target") || "";
    if (!target) return new Response("Missing x-seedance-target", { status: 400 });

    let url: URL;
    try {
        url = new URL(target);
    } catch {
        return new Response("Invalid x-seedance-target", { status: 400 });
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return new Response("Unsupported Seedance target", { status: 400 });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEEDANCE_PROXY_TIMEOUT_MS);
    try {
        const body = method === "GET" ? undefined : await request.arrayBuffer();
        const response = await fetch(url, {
            method,
            headers: proxyHeaders(request),
            body: body?.byteLength ? body : undefined,
            signal: controller.signal,
        });
        return new Response(method === "GET" ? response.body : response.body, {
            status: response.status,
            headers: responseHeaders(response.headers),
        });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return new Response("Seedance proxy timeout", { status: 504 });
        return new Response(error instanceof Error ? error.message : "Seedance proxy error", { status: 502 });
    } finally {
        clearTimeout(timer);
    }
}

function proxyHeaders(request: NextRequest) {
    const headers = new Headers();
    copyHeader(request, headers, "authorization", "Authorization");
    copyHeader(request, headers, "content-type", "Content-Type");
    return headers;
}

function copyHeader(request: NextRequest, headers: Headers, from: string, to: string) {
    const value = request.headers.get(from);
    if (value) headers.set(to, value);
}

function responseHeaders(headers: Headers) {
    const result = new Headers();
    const contentType = headers.get("content-type");
    if (contentType) result.set("content-type", contentType);
    return result;
}
