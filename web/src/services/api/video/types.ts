import type { AiConfig } from "@/stores/use-config-store";
import type { ReferenceImage } from "@/types/image";
import type { ReferenceAudio, ReferenceVideo } from "@/types/media";

export type VideoProviderId = "openai-json" | "seedance" | "openai";

export type VideoRequestOptions = {
    signal?: AbortSignal;
};

export type VideoCreateInput = {
    config: AiConfig;
    model: string;
    prompt: string;
    references: ReferenceImage[];
    videoReferences: ReferenceVideo[];
    audioReferences: ReferenceAudio[];
    options?: VideoRequestOptions;
};

export type VideoGenerationResult = {
    blob?: Blob;
    url?: string;
    mimeType?: string;
};

export type VideoGenerationTask = {
    id: string;
    provider: VideoProviderId;
    model: string;
};

export type VideoGenerationTaskState = { status: "pending" } | { status: "completed"; result: VideoGenerationResult } | { status: "failed"; error: string };

export type VideoProviderAdapter = {
    id: Exclude<VideoProviderId, "openai">;
    createTask(input: VideoCreateInput): Promise<VideoGenerationTask>;
    pollTask(config: AiConfig, task: VideoGenerationTask, options?: VideoRequestOptions): Promise<VideoGenerationTaskState>;
};

export type ApiEnvelope<T> = T | { code?: number; data?: T | null; msg?: string };

export type OpenAIVideoResponse = {
    id: string;
    status?: "queued" | "in_progress" | "running" | "completed" | "succeeded" | "failed" | "cancelled" | "expired";
    url?: string;
    task_result?: {
        videos?: Array<{
            id?: string;
            url?: string;
            duration?: string;
        }>;
    };
    error?: { message?: string } | null;
};

export type SeedanceTaskResponse = {
    id: string;
    status?: "queued" | "running" | "succeeded" | "failed" | "cancelled" | "expired";
    error?: { code?: string; message?: string } | null;
    content?: { video_url?: string; last_frame_url?: string } | null;
};
