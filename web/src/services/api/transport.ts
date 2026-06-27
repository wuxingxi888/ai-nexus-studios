import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

import type { AiConfig } from "@/stores/use-config-store";

const AI_PROXY_URL = "/api/ai-proxy";
const AI_PROXY_TARGET_HEADER = "x-ai-target";

export function apiTransportUrl(config: Pick<AiConfig, "proxyMode">, url: string) {
    return config.proxyMode === "nextjs" ? AI_PROXY_URL : url;
}

export function apiTransportHeaders(config: Pick<AiConfig, "proxyMode">, url: string, headers?: HeadersInit | Record<string, string>) {
    if (config.proxyMode !== "nextjs") return headers;
    const nextHeaders = new Headers(headers);
    nextHeaders.set(AI_PROXY_TARGET_HEADER, url);
    return nextHeaders;
}

export function apiFetch(config: Pick<AiConfig, "proxyMode">, url: string, init: RequestInit = {}) {
    return fetch(apiTransportUrl(config, url), {
        ...init,
        headers: apiTransportHeaders(config, url, init.headers),
    });
}

export function apiAxios<T = unknown>(config: Pick<AiConfig, "proxyMode">, request: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const url = request.url || "";
    return axios.request<T>({
        ...request,
        url: apiTransportUrl(config, url),
        headers: apiTransportHeaderObject(config, url, request.headers as Record<string, string>) as AxiosRequestConfig["headers"],
    });
}

function apiTransportHeaderObject(config: Pick<AiConfig, "proxyMode">, url: string, headers?: HeadersInit | Record<string, string>) {
    const nextHeaders = apiTransportHeaders(config, url, headers);
    if (!nextHeaders || !(nextHeaders instanceof Headers)) return nextHeaders;
    return Object.fromEntries(nextHeaders.entries());
}
