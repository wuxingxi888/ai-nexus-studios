"use client";

import { CalendarDays, Clapperboard, Play, UserRound } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";

import type { AiDramaCase } from "./ai-drama-cases";

type AiDramaCardProps = {
    item: AiDramaCase;
    featured?: boolean;
    onPreview: (item: AiDramaCase) => void;
    onProcess: () => void;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function AiDramaCard({ item, featured = false, onPreview, onProcess }: AiDramaCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playInline = () => {
        const video = videoRef.current;
        if (!video) return;
        setIsPlaying(true);
        void video.play().catch(() => setIsPlaying(false));
    };

    const stopInline = () => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
    };

    const openPreview = () => onPreview(item);

    const handleProcessClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onProcess();
    };

    const contentClassName = featured ? "min-h-[240px] p-6 sm:p-7" : "min-h-[168px] p-5";
    const titleClassName = featured ? "line-clamp-2 text-3xl sm:text-4xl" : "line-clamp-1 text-[22px] leading-tight";
    const descriptionClassName = featured ? "mt-3 line-clamp-2 max-w-xl text-sm leading-6 sm:text-base" : "mt-2 line-clamp-1 text-[13px] leading-5";
    const actionClassName = featured ? "mt-5 gap-3" : "mt-4 gap-2";
    const primaryActionClassName = featured ? "px-4 py-2 text-sm" : "px-3.5 py-1.5 text-sm";
    const secondaryActionClassName = featured ? "px-4 py-2 text-sm" : "px-3.5 py-1.5 text-sm";

    return (
        <article
            onMouseEnter={playInline}
            onMouseLeave={stopInline}
            onFocus={playInline}
            onBlur={stopInline}
            className={[
                "group relative isolate flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#111119] text-left text-white shadow-[0_22px_80px_rgba(0,0,0,0.28)] outline-none ring-1 ring-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-white/[0.2] hover:shadow-[0_26px_90px_rgba(0,0,0,0.38)] focus-visible:ring-2 focus-visible:ring-white/[0.7]",
                featured ? "min-h-[520px] lg:col-span-2 lg:row-span-2" : "min-h-[270px]",
            ].join(" ")}
        >
            <img src={item.thumbnailUrl} alt={item.title} className={["absolute inset-0 z-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]", isPlaying ? "opacity-0" : "opacity-100"].join(" ")} />
            <video ref={videoRef} src={item.videoUrl} poster={item.thumbnailUrl} className={["absolute inset-0 z-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]", isPlaying ? "opacity-100" : "opacity-0"].join(" ")} muted loop playsInline preload="metadata" />
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(3,3,8,0.02)_0%,rgba(3,3,8,0.28)_44%,rgba(3,3,8,0.86)_100%)]" />
            <div className="absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-white/[0.2] transition duration-300 group-hover:opacity-100" />
            <button type="button" onClick={openPreview} className="absolute inset-0 z-20 cursor-pointer rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.72]" aria-label={`播放 ${item.title}`} />

            <div className={["pointer-events-none relative z-30 mt-auto flex flex-col justify-end", contentClassName].join(" ")}>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-white/[0.62]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.1] px-2.5 py-1 backdrop-blur-md">
                        <UserRound className="size-3" />
                        {item.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.1] px-2.5 py-1 backdrop-blur-md">
                        <CalendarDays className="size-3" />
                        {formatDate(item.createdAt)}
                    </span>
                </div>
                <h3 className={["font-semibold tracking-normal", titleClassName].join(" ")}>{item.title}</h3>
                <p className={["text-white/[0.64]", descriptionClassName].join(" ")}>{item.description}</p>

                <div className={["flex flex-wrap items-center", actionClassName].join(" ")}>
                    <span className={["inline-flex items-center gap-2 rounded-full bg-white font-semibold text-stone-950 shadow-[0_14px_34px_rgba(255,255,255,0.16)]", primaryActionClassName].join(" ")}>
                        <Play className="size-3.5 fill-stone-950" />
                        立即观看
                    </span>
                    <button
                        type="button"
                        onClick={handleProcessClick}
                        className={["pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.08] font-medium text-white/[0.72] backdrop-blur-xl transition hover:border-white/[0.28] hover:bg-white/[0.14] hover:text-white", secondaryActionClassName].join(" ")}
                    >
                        <Clapperboard className="size-3.5" />
                        查看制作过程
                    </button>
                </div>
            </div>
        </article>
    );
}
