"use client";

import { ArrowRight, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { App, Button, Image, Tag } from "antd";

import { fetchPrompts, type Prompt } from "@/services/api/prompts";
import { navigationTools } from "@/constant/navigation-tools";
import { cn } from "@/lib/utils";
import { AiDramaShowcase } from "./components/ai-drama-showcase";
import { AdaptiveHeroBackground } from "./components/hero-background";

const IMAGE_CASE_LAYOUTS = [
    "md:col-span-6 md:row-span-2",
    "md:col-span-6",
    "md:col-span-3",
    "md:col-span-3",
    "md:col-span-4",
    "md:col-span-4",
    "md:col-span-4",
];

export function HomePage() {
    const { message } = App.useApp();
    const [primaryTool] = navigationTools;
    const [promptShowcase, setPromptShowcase] = useState<Prompt[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);

    const imageCases = promptShowcase.slice(0, 7);
    const previewImages = imageCases.filter((item): item is Prompt & { coverUrl: string } => Boolean(item.coverUrl));

    useEffect(() => {
        void fetchPrompts({ category: "davidwu-gpt-image2-prompts", pageSize: 12 })
            .then((data) => setPromptShowcase(data.items))
            .catch((error) => message.error(error instanceof Error ? error.message : "获取提示词失败"));
    }, [message]);

    return (
        <main
            data-nav-scroll-root
            className="relative h-full overflow-y-auto bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] text-stone-950 [background-size:16px_16px] dark:bg-[radial-gradient(rgba(245,245,244,.16)_1px,transparent_1px)] dark:text-stone-100"
        >
            <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[100vh] overflow-hidden rounded-none">
                    <AdaptiveHeroBackground />
                </div>

                <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 pb-24 pt-36 text-center sm:pt-40">
                    <div className="flex w-full max-w-5xl flex-col items-center gap-2 sm:gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 p-1 text-sm text-white/70 shadow-[0_18px_60px_rgba(8,8,30,0.24)] backdrop-blur-2xl">
                            <span className="rounded-full bg-white px-3 py-1 font-semibold text-stone-950">NEW</span>
                            <span className="pr-3 font-medium">Nexus Studios 创作工作区</span>
                        </div>

                        <h1 className="ai-title-aurora max-w-5xl text-balance text-5xl font-semibold leading-[1.03] tracking-normal text-white drop-shadow-[0_18px_50px_rgba(8,8,30,0.28)] sm:text-4xl lg:text-6xl">
                            让灵感在画布上
                            <br className="hidden sm:block" />
                            连续生长
                        </h1>

                        <p className="max-w-3xl text-balance text-base leading-8 text-white/80 sm:text-lg">把画布编排、AI 图片生成、AI 视频生成、参考图编辑、对话助手和素材管理放进同一个流动工作区。</p>

                        <div className="flex flex-wrap items-center justify-center gap-4 sm:mt-3">
                            <Button
                                href={`/${primaryTool.slug}`}
                                className="!inline-flex !h-12 !min-w-36 !items-center !justify-center !rounded-2xl !border-0 !bg-white !px-6 !text-sm !font-semibold !leading-none !text-stone-950 !shadow-[0_14px_34px_rgba(255,255,255,0.14)] hover:!bg-white hover:!text-stone-950 sm:!h-14 sm:!min-w-40 sm:!px-7 sm:!text-base"
                            >
                                开始创作
                            </Button>
                            <Button
                                href="/canvas"
                                className="!inline-flex !h-12 !min-w-36 !items-center !justify-center !rounded-2xl !border !border-white/14 !bg-[rgba(111,59,221,0.22)] !px-6 !text-sm !font-semibold !leading-none !text-white/76 !shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_12px_30px_rgba(42,8,92,0.2)] !backdrop-blur-2xl hover:!border-white/24 hover:!bg-[rgba(124,73,230,0.3)] hover:!text-white sm:!h-14 sm:!min-w-40 sm:!px-7 sm:!text-base"
                            >
                                打开画布
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative mx-auto max-w-7xl px-6 py-20">
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-medium text-stone-500 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                            <Images className="size-3.5" />
                            图片案例
                        </div>
                        <h2 className="text-balance text-3xl font-semibold tracking-normal text-stone-950 dark:text-stone-100 sm:text-4xl">把灵感沉淀成可复用的视觉资产</h2>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-500 dark:text-stone-400">从提示词、参考图到最终结果，案例不只是展示图，而是下一次画布编排和生图迭代的起点。</p>
                    </div>
                    <Button type="link" href="/prompts" className="self-start !px-0 md:self-auto" icon={<ArrowRight className="size-4" />} iconPlacement="end">
                        查看提示词库
                    </Button>
                </div>

                <div className="grid auto-rows-[220px] gap-5 md:grid-cols-12">
                    {imageCases.map((item, index) => {
                        const previewImageIndex = previewImages.findIndex((image) => image.id === item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    if (previewImageIndex < 0) return;
                                    setPreviewIndex(previewImageIndex);
                                    setPreviewOpen(true);
                                }}
                                className={cn(
                                    "group relative !overflow-hidden rounded-3xl border border-white/70 bg-white/70 text-left shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-stone-950/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.04] dark:ring-white/10",
                                    IMAGE_CASE_LAYOUTS[index] ?? "md:col-span-4",
                                )}
                                style={{ borderRadius: 28 }}
                            >
                                {item.coverUrl ? (
                                    <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(43,62,190,0.2),transparent_42%),#111017] p-6 text-center text-sm leading-6 text-white/70">{item.title}</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/22 to-transparent opacity-95" />
                                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {(item.tags.length ? item.tags : ["AI 生成"]).slice(0, 2).map((tag) => (
                                            <Tag key={tag} variant="filled" className="m-0 rounded-full border-white/[0.15] bg-white/[0.14] px-2.5 py-0.5 text-[11px] text-white backdrop-blur">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </div>
                                    <h3 className="line-clamp-1 text-base font-semibold">{item.title}</h3>
                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/72">{item.prompt}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <AiDramaShowcase />

            <Image.PreviewGroup
                preview={{
                    open: previewOpen,
                    current: previewIndex,
                    onOpenChange: setPreviewOpen,
                    onChange: setPreviewIndex,
                }}
            >
                <div className="hidden">
                    {previewImages.map((item) => (
                        <Image key={item.id} src={item.coverUrl} alt={item.title} />
                    ))}
                </div>
            </Image.PreviewGroup>
        </main>
    );
}
