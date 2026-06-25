"use client";

import dynamic from "next/dynamic";

const LightfallBackground = dynamic(() => import("./lightfall-background").then((mod) => mod.LightfallBackground), {
    ssr: false,
});

const LIGHTFALL_COLORS = ["#A6C8FF", "#5227FF", "#FF9FFC"];

export function LightFallHeroBackground() {
    return (
        <LightfallBackground
            colors={LIGHTFALL_COLORS}
            backgroundColor="#2b3ebe"
            speed={0.8}
            streakCount={2}
            streakWidth={1.1}
            streakLength={1}
            glow={2.2}
            density={0.6}
            twinkle={1}
            zoom={3}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction={false}
            mouseStrength={0}
            mouseRadius={0.7}
        />
    );
}
