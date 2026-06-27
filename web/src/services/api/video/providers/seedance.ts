import { apiAxios } from "@/services/api/transport";
import { modelOptionName, type AiConfig } from "@/stores/use-config-store";
import { boolConfig, buildSeedancePromptText, normalizeSeedanceDuration, normalizeSeedanceRatio, normalizeSeedanceResolution, seedanceVideoReferenceError, SEEDANCE_REFERENCE_LIMITS } from "@/services/api/video/seedance";
import { resolveAudioReferenceUrl, resolveImageReferenceUrl, resolveVideoReferenceUrl } from "../references";
import { readVideoAxiosError, unwrapEnvelope, videoHeaders, videoResultFromUrl } from "../shared";
import type { ApiEnvelope, SeedanceTaskResponse, VideoCreateInput, VideoGenerationTask, VideoGenerationTaskState, VideoProviderAdapter } from "../types";

export const seedanceVideoProvider: VideoProviderAdapter = {
    id: "seedance",
    async createTask(input) {
        assertSeedanceReferences(input);
        const content = await buildSeedanceContent(input);
        if (!content.length) throw new Error("请输入视频提示词，或连接参考图片/视频/音频");
        const payload = {
            model: modelOptionName(input.model),
            content,
            ratio: normalizeSeedanceRatio(input.config.size),
            resolution: normalizeSeedanceResolution(input.config.vquality, modelOptionName(input.model)),
            duration: normalizeSeedanceDuration(input.config.videoSeconds),
            generate_audio: boolConfig(input.config.videoGenerateAudio, true),
            watermark: boolConfig(input.config.videoWatermark, false),
        };

        try {
            const response = await apiAxios<ApiEnvelope<SeedanceTaskResponse>>(input.config, { method: "POST", url: seedanceApiUrl(input.config), data: payload, headers: videoHeaders(input.config), signal: input.options?.signal });
            const created = unwrapEnvelope<SeedanceTaskResponse>(response.data, "Seedance 接口没有返回任务");
            if (!created.id) throw new Error("Seedance 接口没有返回任务 ID");
            return { id: created.id, provider: "seedance", model: input.model };
        } catch (error) {
            throw new Error(readVideoAxiosError(error, "Seedance 任务创建失败"));
        }
    },
    async pollTask(config, task, options) {
        return pollSeedanceTask(config, task, options?.signal);
    },
};

async function buildSeedanceContent(input: VideoCreateInput) {
    const content: Array<Record<string, unknown>> = [];
    const text = buildSeedancePromptText(input.prompt, input.references, input.videoReferences, input.audioReferences);
    if (text) content.push({ type: "text", text });
    for (const image of input.references.slice(0, SEEDANCE_REFERENCE_LIMITS.images)) {
        content.push({ type: "image_url", image_url: { url: await resolveImageReferenceUrl(image) }, role: "reference_image" });
    }
    for (const video of input.videoReferences.slice(0, SEEDANCE_REFERENCE_LIMITS.videos)) {
        content.push({ type: "video_url", video_url: { url: await resolveVideoReferenceUrl(video) }, role: "reference_video" });
    }
    for (const audio of input.audioReferences.slice(0, SEEDANCE_REFERENCE_LIMITS.audios)) {
        content.push({ type: "audio_url", audio_url: { url: await resolveAudioReferenceUrl(audio) }, role: "reference_audio" });
    }
    return content;
}

async function pollSeedanceTask(config: AiConfig, task: VideoGenerationTask, signal?: AbortSignal): Promise<VideoGenerationTaskState> {
    try {
        const response = await apiAxios<ApiEnvelope<SeedanceTaskResponse>>(config, { method: "GET", url: seedanceApiUrl(config, task.id), headers: videoHeaders(config), signal });
        const state = unwrapEnvelope<SeedanceTaskResponse>(response.data, "Seedance 接口没有返回任务");
        if (state.status === "succeeded") {
            const url = state.content?.video_url;
            if (!url) return { status: "failed", error: "Seedance 任务成功但没有返回视频 URL" };
            return { status: "completed", result: await videoResultFromUrl(url, signal) };
        }
        if (state.status === "failed" || state.status === "cancelled" || state.status === "expired") return { status: "failed", error: state.error?.message || `Seedance 视频生成${state.status === "expired" ? "超时" : "失败"}` };
        return { status: "pending" };
    } catch (error) {
        throw new Error(readVideoAxiosError(error, "Seedance 任务查询失败"));
    }
}

function assertSeedanceReferences(input: VideoCreateInput) {
    if (input.audioReferences.length && !input.references.length && !input.videoReferences.length) {
        throw new Error("Seedance 参考音频不能单独使用，请同时添加参考图或参考视频");
    }
    const videoError = seedanceVideoReferenceError(input.videoReferences);
    if (videoError) throw new Error(videoError);
    let audioDurationMs = 0;
    for (const audio of input.audioReferences) {
        if (!audio.durationMs) continue;
        if (audio.durationMs < 2000 || audio.durationMs > 15000) throw new Error("Seedance 参考音频单个时长需要在 2-15 秒之间");
        audioDurationMs += audio.durationMs;
    }
    if (audioDurationMs > 15000) throw new Error("Seedance 参考音频总时长不能超过 15 秒");
}

function seedanceApiUrl(config: AiConfig, taskId?: string) {
    const baseUrl = config.baseUrl.trim().replace(/\/+$/, "");
    const path = `/contents/generations/tasks${taskId ? `/${encodeURIComponent(taskId)}` : ""}`;
    return baseUrl.toLowerCase().endsWith("/api/plan/v3") ? `${baseUrl}${path}` : `${baseUrl}/v1${path}`;
}
