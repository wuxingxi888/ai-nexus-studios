"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { App, Button, Image, Tag } from "antd";

import { fetchPrompts, type Prompt } from "@/services/api/prompts";
import { navigationTools } from "@/constant/navigation-tools";
import { cn } from "@/lib/utils";
import { AdaptiveHeroBackground } from "./components/hero-background";

export function HomePage() {
    const { message } = App.useApp();
    const [primaryTool] = navigationTools;
    const [promptShowcase, setPromptShowcase] = useState<Prompt[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        void fetchPrompts({ pageSize: 12 })
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

                <section className="relative mx-auto mb-20 max-w-6xl border-t border-stone-200 px-6 pt-12 dark:border-stone-800">
                    <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
                        <div />
                        <div className="max-w-2xl text-center">
                            <h2 className="text-3xl font-semibold text-stone-950 dark:text-stone-100">沉淀每一次好结果</h2>
                            <p className="mt-3 text-base leading-7 text-stone-500 dark:text-stone-400">收藏稳定出图的提示词、参考风格和结果图片，让下一次创作从已有经验开始。</p>
                        </div>
                        <Button type="link" href="/prompts" className="justify-self-center md:justify-self-end" icon={<ArrowRight className="size-4" />} iconPlacement="end">
                            查看提示词库
                        </Button>
                    </div>
                    <div className="grid auto-rows-[210px] gap-4 md:grid-cols-4">
                        {promptShowcase.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setPreviewIndex(index);
                                    setPreviewOpen(true);
                                }}
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden border border-stone-200 bg-stone-100 text-left dark:border-stone-800 dark:bg-stone-900",
                                    index === 0 && "md:col-span-2 md:row-span-2",
                                    index === 3 && "md:col-span-2",
                                )}
                            >
                                {item.coverUrl ? (
                                    <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-stone-100 p-5 text-center text-sm leading-6 text-stone-500 dark:bg-stone-900 dark:text-stone-400">{item.title}</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 text-white">
                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                        {item.tags.slice(0, 2).map((tag) => (
                                            <Tag key={tag} variant="filled" className="m-0 bg-white/15 text-[11px] text-white backdrop-blur">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </div>
                                    <h3 className="text-sm font-medium">{item.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">{item.prompt}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </section>
            <Image.PreviewGroup
                preview={{
                    open: previewOpen,
                    current: previewIndex,
                    onOpenChange: setPreviewOpen,
                    onChange: setPreviewIndex,
                }}
            >
                <div className="hidden">
                    {promptShowcase
                        .filter((item) => item.coverUrl)
                        .map((item) => (
                            <Image key={item.id} src={item.coverUrl} alt={item.title} />
                        ))}
                </div>
            </Image.PreviewGroup>
        </main>
    );
}
