"use client";

import { ArrowRight, Film, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { App, Button, Modal } from "antd";

import { AI_DRAMA_CASES, type AiDramaCase } from "./ai-drama-cases";
import { AiDramaCard } from "./ai-drama-card";

export function AiDramaShowcase() {
    const { message } = App.useApp();
    const [activeCase, setActiveCase] = useState<AiDramaCase | null>(null);

    const showProcessTodo = () => {
        void message.info("正在开发中");
    };

    return (
        <section className="relative mx-auto max-w-7xl px-6 pb-24">
            <div className="overflow-hidden rounded-[36px] border border-stone-950/10 bg-[#07070c] text-white shadow-[0_34px_120px_rgba(15,23,42,0.3)] ring-1 ring-white/[0.06] dark:border-white/[0.1]">
                <div className="relative px-5 py-6 sm:px-8 sm:py-9 lg:px-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_18%_8%,rgba(73,105,255,0.24),transparent_34%),radial-gradient(circle_at_84%_0%,rgba(255,255,255,0.12),transparent_30%)]" />

                    <div className="relative z-10 mb-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/[0.6] backdrop-blur-xl">
                                <Film className="size-3.5" />
                                AI 漫剧样片
                            </div>
                            <h2 className="text-balance text-3xl font-semibold tracking-normal sm:text-4xl lg:text-5xl">把分镜、角色和动作连成一段故事</h2>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-white/[0.6]">
                                参考 LingCut 作品鉴赏数据，展示可直接播放的 AI 漫剧片段。移入卡片即可内联预览，点击进入沉浸式大屏观看。
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                href="/video"
                                icon={<ArrowRight className="size-4" />}
                                iconPlacement="end"
                                className="!inline-flex !h-11 !items-center !rounded-full !border-0 !bg-white !px-5 !font-semibold !text-stone-950 hover:!bg-white hover:!text-stone-950"
                            >
                                打开视频创作台
                            </Button>
                            <Button onClick={showProcessTodo} className="!inline-flex !h-11 !items-center !rounded-full !border-white/[0.14] !bg-white/[0.07] !px-5 !font-semibold !text-white/[0.72] !backdrop-blur-xl hover:!border-white/[0.28] hover:!bg-white/[0.13] hover:!text-white">
                                查看制作过程
                            </Button>
                        </div>
                    </div>

                    <div className="relative z-10 grid auto-rows-[270px] gap-4 lg:grid-cols-4">
                        {AI_DRAMA_CASES.map((item, index) => (
                            <AiDramaCard key={item.id} item={item} featured={index === 0} onPreview={setActiveCase} onProcess={showProcessTodo} />
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                open={Boolean(activeCase)}
                footer={null}
                closable={false}
                centered={false}
                width="100vw"
                onCancel={() => setActiveCase(null)}
                destroyOnHidden
                style={{ top: 0, maxWidth: "100vw", paddingBottom: 0 }}
                styles={{
                    wrapper: { padding: 0 },
                    content: { height: "100dvh", padding: 0, overflow: "hidden", borderRadius: 0, background: "#050508" },
                    body: { height: "100%", padding: 0 },
                }}
            >
                {activeCase ? (
                    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#050508] text-white">
                        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 p-4 sm:p-6">
                            <button type="button" onClick={() => setActiveCase(null)} className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-black/[0.3] px-4 py-2 text-sm font-medium text-white/[0.76] backdrop-blur-2xl transition hover:border-white/[0.3] hover:bg-white/[0.12] hover:text-white">
                                <X className="size-4" />
                                返回作品鉴赏
                            </button>
                            <button type="button" onClick={showProcessTodo} className="hidden items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.08] px-4 py-2 text-sm font-medium text-white/[0.72] backdrop-blur-2xl transition hover:border-white/[0.3] hover:bg-white/[0.14] hover:text-white sm:inline-flex">
                                <Sparkles className="size-4" />
                                查看制作过程
                            </button>
                        </div>

                        <video src={activeCase.videoUrl} poster={activeCase.thumbnailUrl} controls autoPlay playsInline className="h-full w-full bg-black object-contain" />

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/[0.8] via-black/[0.36] to-transparent px-5 pb-7 pt-24 sm:px-8">
                            <p className="text-sm text-white/[0.52]">作者 / {activeCase.author}</p>
                            <h3 className="mt-2 text-3xl font-semibold sm:text-5xl">{activeCase.title}</h3>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.64] sm:text-base">{activeCase.description}</p>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </section>
    );
}
