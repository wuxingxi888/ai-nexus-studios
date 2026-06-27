import { resolveModelRequestConfig, type AiConfig } from "@/stores/use-config-store";
import { customTaskVideoProvider } from "./providers/custom-task";
import { openAICompatibleVideoProvider } from "./providers/openai-compatible";
import { seedanceVideoProvider } from "./providers/seedance";
import type { VideoProviderAdapter } from "./types";

const providers: Record<VideoProviderAdapter["id"], VideoProviderAdapter> = {
    "openai-compatible": openAICompatibleVideoProvider,
    seedance: seedanceVideoProvider,
    "custom-task": customTaskVideoProvider,
};

export function resolveVideoProvider(config: AiConfig, model: string) {
    const requestConfig = resolveModelRequestConfig(config, model);
    // 视频分流只依赖渠道类型和模型级覆盖，不再通过模型名猜测协议。
    if (requestConfig.channelType === "custom-task") return providers["custom-task"];
    if (requestConfig.channelType === "seedance") return providers.seedance;
    return providers["openai-compatible"];
}

export function getVideoProviderByTask(providerId: string) {
    return providers[providerId as VideoProviderAdapter["id"]] || providers["openai-compatible"];
}
