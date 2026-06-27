import { apiAxios } from "@/services/api/transport";
import { modelOptionName, type AiConfig } from "@/stores/use-config-store";
import { resolveImageReferenceUrl } from "../references";
import { readVideoAxiosError, unwrapEnvelope, videoApiUrl, videoHeaders, videoResultFromUrl } from "../shared";
import type { ApiEnvelope, OpenAIVideoResponse, VideoCreateInput, VideoGenerationTask, VideoGenerationTaskState, VideoProviderAdapter } from "../types";

type OpenAICompatibleVideoPayload = {
    model: string;
    prompt: string;
    seconds: string;
    size?: string;
    input_reference?: string[];
};

export const openAICompatibleVideoProvider: VideoProviderAdapter = {
    id: "openai-compatible",
    async createTask(input) {
        if (input.videoReferences.length || input.audioReferences.length) {
            throw new Error("OpenAI 兼容视频接口暂不支持参考视频或参考音频，请移除参考素材或切换渠道类型");
        }
        const payload = await buildOpenAICompatibleVideoPayload(input);
        try {
            const response = await apiAxios<ApiEnvelope<OpenAIVideoResponse>>(input.config, { method: "POST", url: videoApiUrl(input.config, "/videos"), data: payload, headers: videoHeaders(input.config), signal: input.options?.signal });
            const created = unwrapEnvelope<OpenAIVideoResponse>(response.data, "接口没有返回视频任务");
            return openAICompatibleTaskFromResponse(created, input.model);
        } catch (error) {
            throw new Error(readVideoAxiosError(error, "视频任务创建失败"));
        }
    },
    async pollTask(config, task, options) {
        return pollOpenAICompatibleVideoTask(config, task, options?.signal);
    },
};

async function buildOpenAICompatibleVideoPayload(input: VideoCreateInput): Promise<OpenAICompatibleVideoPayload> {
    const inputReference = await Promise.all(input.references.slice(0, 7).map(resolveImageReferenceUrl));
    const payload: OpenAICompatibleVideoPayload = {
        model: modelOptionName(input.model),
        prompt: input.prompt,
        seconds: normalizeVideoSeconds(input.config.videoSeconds),
    };
    const size = normalizeVideoSize(input.config.size);
    if (size) payload.size = size;
    // NewAPI 等 OpenAI 兼容上游约定参考图为 URL 数组：{ "input_reference": ["https://..."] }。
    if (inputReference.length) payload.input_reference = inputReference;
    return payload;
}

async function pollOpenAICompatibleVideoTask(config: AiConfig, task: VideoGenerationTask, signal?: AbortSignal): Promise<VideoGenerationTaskState> {
    try {
        const response = await apiAxios<ApiEnvelope<OpenAIVideoResponse>>(config, { method: "GET", url: videoApiUrl(config, `/videos/${task.id}`), headers: videoHeaders(config), signal });
        const video = unwrapEnvelope<OpenAIVideoResponse>(response.data, "接口没有返回视频任务");
        if (video.status === "completed" || video.status === "succeeded") {
            const videoUrl = resolveOpenAIVideoUrl(video);
            if (!videoUrl) return { status: "failed", error: "视频任务成功但没有返回视频 URL" };
            return { status: "completed", result: await videoResultFromUrl(videoUrl, signal) };
        }
        if (video.status === "failed" || video.status === "cancelled" || video.status === "expired") return { status: "failed", error: video.error?.message || "视频生成失败" };
        return { status: "pending" };
    } catch (error) {
        throw new Error(readVideoAxiosError(error, "视频任务查询失败"));
    }
}

function resolveOpenAIVideoUrl(video: OpenAIVideoResponse) {
    return video.url || video.task_result?.videos?.find((item) => item.url)?.url || "";
}

function openAICompatibleTaskFromResponse(created: OpenAIVideoResponse, model: string): VideoGenerationTask {
    if (!created.id) throw new Error("视频接口没有返回任务 ID");
    return { id: created.id, provider: "openai-compatible", model };
}

function normalizeVideoSeconds(value: string) {
    const seconds = Math.floor(Number(value) || 6);
    return String(Math.max(1, Math.min(20, seconds)));
}

function normalizeVideoSize(value: string) {
    if (value === "auto") return null;
    const size = value || "1280x720";
    if (/^\d+x\d+$/.test(size)) return size;
    return ["9:16", "2:3", "3:4"].includes(size) ? "720x1280" : "1280x720";
}
