"use client";

import { useEffect, useState } from "react";

import { DotFieldBackground } from "./dot-field";
import { LightFallHeroBackground } from "./lightfall";
import { ShapeGridBackground } from "./shape-grid";

type HeroBackgroundMode = "lightfall" | "shape-grid" | "dot-field";

const HERO_BACKGROUND_MODES: HeroBackgroundMode[] = ["lightfall", "shape-grid", "dot-field"];

function pickHeroBackground(): HeroBackgroundMode {
    return HERO_BACKGROUND_MODES[Math.floor(Math.random() * HERO_BACKGROUND_MODES.length)];
}

export function AdaptiveHeroBackground() {
    const [mode, setMode] = useState<HeroBackgroundMode>("lightfall");

    useEffect(() => {
        setMode(pickHeroBackground());
    }, []);

    if (mode === "shape-grid") {
        return <ShapeGridBackground direction="diagonal" speed={0.5} borderColor="#2F293A" hoverFillColor="#222222" />;
    }
    if (mode === "dot-field") return <DotFieldBackground />;

    return <LightFallHeroBackground />;
}
