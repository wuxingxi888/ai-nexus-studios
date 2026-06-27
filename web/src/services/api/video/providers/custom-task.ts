import { apiAxios } from "@/services/api/transport";
import { modelOptionName, type AiConfig } from "@/stores/use-config-store";
import { resolveAudioReferenceUrl, resolveImageReferenceUrl, resolveVideoReferenceUrl } from "../references";
import { readVideoAxiosError, videoHeaders, videoResultFromUrl } from "../shared";
import type { VideoCreateInput, VideoGenerationTask, VideoGenerationTaskState, VideoProviderAdapter } from "../types";

type CustomTaskContext = {
    model: string;
    prompt: string;
    seconds: string;
    size: string;
    ratio: string;
    resolution: string;
    imageUrls: string[];
    videoUrls: string[];
    audioUrls: string[];
    taskId?: string;
};

export const customTaskVideoProvider: VideoProviderAdapter = {
    id: "custom-task",
    async createTask(input) {
        const protocol = input.config.customVideoProtocol;
        const context = await buildCustomTaskContext(input);
        const url = customTaskUrl(input.config, renderString(protocol.createPath, context));
        const body = renderJsonTemplate(protocol.createBodyTemplate, context);
        try {
            const response = await apiAxios<unknown>(input.config, { method: "POST", url, data: body, headers: videoHeaders(input.config), signal: input.options?.signal });
            const id = stringValue(readPath(response.data, protocol.taskIdPath));
            if (!id) throw new Error("自定义视频协议没有解析到任务 ID");
            return { id, provider: "custom-task", model: input.model };
        } catch (error) {
            throw new Error(readVideoAxiosError(error, "自定义视频任务创建失败"));
        }
    },
    async pollTask(config, task, options) {
        return pollCustomTask(config, task, options?.signal);
    },
};

async function pollCustomTask(config: AiConfig, task: VideoGenerationTask, signal?: AbortSignal): Promise<VideoGenerationTaskState> {
    const protocol = config.customVideoProtocol;
    const context = { model: modelOptionName(task.model), prompt: "", seconds: config.videoSeconds, size: config.size, ratio: config.size, resolution: config.vquality, imageUrls: [], videoUrls: [], audioUrls: [], taskId: task.id };
    const url = customTaskUrl(config, renderString(protocol.pollPath, context));
    const data = protocol.pollMethod === "POST" && protocol.pollBodyTemplate.trim() ? renderJsonTemplate(protocol.pollBodyTemplate, context) : undefined;
    try {
        const response = await apiAxios<unknown>(config, { method: protocol.pollMethod, url, data, headers: videoHeaders(config), signal });
        const status = stringValue(readPath(response.data, protocol.statusPath));
        if (statusIn(status, protocol.completedStatuses)) {
            const url = stringValue(readPath(response.data, protocol.resultUrlPath));
            if (!url) return { status: "failed", error: "自定义视频任务成功但没有解析到视频 URL" };
            return { status: "completed", result: await videoResultFromUrl(url, signal) };
        }
        if (statusIn(status, protocol.failedStatuses)) return { status: "failed", error: stringValue(readPath(response.data, protocol.errorMessagePath)) || "自定义视频任务失败" };
        return { status: "pending" };
    } catch (error) {
        throw new Error(readVideoAxiosError(error, "自定义视频任务查询失败"));
    }
}

async function buildCustomTaskContext(input: VideoCreateInput): Promise<CustomTaskContext> {
    const [imageUrls, videoUrls, audioUrls] = await Promise.all([
        Promise.all(input.references.map(resolveImageReferenceUrl)),
        Promise.all(input.videoReferences.map(resolveVideoReferenceUrl)),
        Promise.all(input.audioReferences.map(resolveAudioReferenceUrl)),
    ]);
    return {
        model: modelOptionName(input.model),
        prompt: input.prompt,
        seconds: input.config.videoSeconds,
        size: input.config.size,
        ratio: input.config.size,
        resolution: input.config.vquality,
        imageUrls,
        videoUrls,
        audioUrls,
    };
}

function renderJsonTemplate(template: string, context: CustomTaskContext) {
    const text = template.trim();
    if (!text) return undefined;
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error("自定义视频协议 Body 模板不是有效 JSON");
    }
    return renderTemplateValue(parsed, context);
}

function renderTemplateValue(value: unknown, context: CustomTaskContext): unknown {
    if (typeof value === "string") {
        const exact = value.match(/^{{\s*([a-zA-Z0-9_]+)\s*}}$/);
        if (exact) return contextValue(context, exact[1]);
        return renderString(value, context);
    }
    if (Array.isArray(value)) return value.map((item) => renderTemplateValue(item, context));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renderTemplateValue(item, context)]));
    return value;
}

function renderString(value: string, context: CustomTaskContext) {
    return value.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key: string) => stringValue(contextValue(context, key)));
}

function contextValue(context: CustomTaskContext, key: string) {
    return (context as unknown as Record<string, unknown>)[key] ?? "";
}

function customTaskUrl(config: AiConfig, path: string) {
    if (/^https?:\/\//i.test(path)) return path;
    const baseUrl = config.baseUrl.trim().replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
}

function readPath(payload: unknown, path: string) {
    const normalized = path.trim().replace(/\[(\d+)\]/g, ".$1");
    if (!normalized) return undefined;
    return normalized.split(".").reduce<unknown>((current, key) => {
        if (current == null) return undefined;
        if (Array.isArray(current)) return current[Number(key)];
        if (typeof current === "object") return (current as Record<string, unknown>)[key];
        return undefined;
    }, payload);
}

function statusIn(status: string, values: string) {
    if (!status) return false;
    return splitCsv(values).includes(status.toLowerCase());
}

function splitCsv(value: string) {
    return value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function stringValue(value: unknown) {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
}
