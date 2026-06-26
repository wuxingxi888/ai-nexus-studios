import { isSeedanceVideoConfig } from "@/services/api/video/seedance";
import { resolveModelRequestConfig, type AiConfig } from "@/stores/use-config-store";
import { openAIJsonVideoProvider } from "./providers/openai-json";
import { seedanceVideoProvider } from "./providers/seedance";
import type { VideoProviderAdapter } from "./types";

const providers: Record<VideoProviderAdapter["id"], VideoProviderAdapter> = {
    "openai-json": openAIJsonVideoProvider,
    seedance: seedanceVideoProvider,
};

export function resolveVideoProvider(config: AiConfig, model: string) {
    const requestConfig = resolveModelRequestConfig(config, model);
    // 先按明确的火山 Agent Plan / Seedance 特征分流；其他 OpenAI 兼容上游统一走 JSON provider。
    return isSeedanceVideoConfig(requestConfig) ? providers.seedance : providers["openai-json"];
}

export function getVideoProviderByTask(providerId: string) {
    // 兼容旧日志里保存的 provider: "openai"，新架构统一映射到 JSON 视频协议。
    return providerId === "openai" ? providers["openai-json"] : providers[providerId as VideoProviderAdapter["id"]] || providers["openai-json"];
}
