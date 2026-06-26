import { resolveModelRequestConfig, type AiConfig } from "@/stores/use-config-store";
import { assertVideoConfig, delay, storeGeneratedVideo } from "./shared";
import { getVideoProviderByTask, resolveVideoProvider } from "./provider-resolver";
import type { VideoGenerationResult, VideoGenerationTask, VideoGenerationTaskState, VideoRequestOptions } from "./types";
import type { ReferenceImage } from "@/types/image";
import type { ReferenceAudio, ReferenceVideo } from "@/types/media";

export type { VideoGenerationResult, VideoGenerationTask, VideoGenerationTaskState } from "./types";
export { storeGeneratedVideo };

export async function requestVideoGeneration(config: AiConfig, prompt: string, references: ReferenceImage[] = [], videoReferences: ReferenceVideo[] = [], audioReferences: ReferenceAudio[] = [], options?: VideoRequestOptions): Promise<VideoGenerationResult> {
    const task = await createVideoGenerationTask(config, prompt, references, videoReferences, audioReferences, options);
    const delayMs = task.provider === "seedance" ? 5000 : 2500;
    for (let attempt = 0; attempt < 120; attempt += 1) {
        if (options?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
        const state = await pollVideoGenerationTask(config, task, options);
        if (state.status === "completed") return state.result;
        if (state.status === "failed") throw new Error(state.error);
        if (attempt === 119) throw new Error(`${task.provider === "seedance" ? "Seedance " : ""}视频生成超时，请稍后重试`);
        await delay(delayMs, options?.signal);
    }
    throw new Error("视频生成超时，请稍后重试");
}

export async function createVideoGenerationTask(config: AiConfig, prompt: string, references: ReferenceImage[] = [], videoReferences: ReferenceVideo[] = [], audioReferences: ReferenceAudio[] = [], options?: VideoRequestOptions): Promise<VideoGenerationTask> {
    const selectedModel = (config.model || config.videoModel).trim();
    const text = prompt.trim();
    if (!text && !references.length && !videoReferences.length && !audioReferences.length) throw new Error("请输入视频提示词");
    const requestConfig = resolveModelRequestConfig(config, selectedModel);
    assertVideoConfig(requestConfig, requestConfig.model);
    const provider = resolveVideoProvider(config, selectedModel);
    // Provider 只接收归一化后的渠道配置，避免每个实现重复解析 channel。
    return provider.createTask({ config: requestConfig, model: selectedModel, prompt: text, references, videoReferences, audioReferences, options });
}

export async function pollVideoGenerationTask(config: AiConfig, task: VideoGenerationTask, options?: VideoRequestOptions): Promise<VideoGenerationTaskState> {
    const requestConfig = resolveModelRequestConfig(config, task.model);
    assertVideoConfig(requestConfig, requestConfig.model);
    const provider = getVideoProviderByTask(task.provider);
    return provider.pollTask(requestConfig, task, options);
}
