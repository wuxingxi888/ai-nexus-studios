"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AppConfigModal } from "@/components/layout/app-config-modal";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { UserStatusActions } from "@/components/layout/user-status-actions";
import { navigationTools, type NavigationToolSlug } from "@/constant/navigation-tools";
import { cn } from "@/lib/utils";

import styles from "./app-top-nav.module.css";

const SCROLL_THRESHOLD = 16;
const CANVAS_EDITOR_ROUTE = /^\/canvas\/[^/]+/;

function getActiveToolSlug(pathname: string) {
    const slug = pathname.split("/").filter(Boolean)[0];
    return navigationTools.some((tool) => tool.slug === slug) ? (slug as NavigationToolSlug) : undefined;
}

function useFloatingNavState(pathname: string, hidden: boolean) {
    const navRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const nav = navRef.current;
        if (!nav || hidden) return;

        const container = document.querySelector<HTMLElement>("[data-nav-scroll-root]");
        if (!container) return;

        let frame = 0;
        let motionTimer = 0;
        let isFloating = container.scrollTop > SCROLL_THRESHOLD;

        const setNavState = (nextIsFloating: boolean, animated: boolean) => {
            nav.dataset.state = nextIsFloating ? "floating" : "docked";
            if (!animated) return;

            nav.dataset.motion = nextIsFloating ? "float" : "dock";
            if (motionTimer) window.clearTimeout(motionTimer);
            motionTimer = window.setTimeout(() => {
                delete nav.dataset.motion;
                motionTimer = 0;
            }, 680);
        };

        const updateState = () => {
            frame = 0;
            const nextIsFloating = container.scrollTop > SCROLL_THRESHOLD;
            if (nextIsFloating === isFloating) return;
            isFloating = nextIsFloating;
            setNavState(nextIsFloating, true);
        };

        const scheduleUpdate = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(updateState);
        };

        setNavState(isFloating, false);
        container.addEventListener("scroll", scheduleUpdate, { passive: true });

        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            if (motionTimer) window.clearTimeout(motionTimer);
            container.removeEventListener("scroll", scheduleUpdate);
        };
    }, [hidden, pathname]);

    return navRef;
}

function NavBrand({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <div className="flex min-w-0 items-center px-4 sm:px-5">
            <Link href="/" className="flex h-full shrink-0 items-center gap-2 text-sm font-semibold leading-none tracking-tight text-stone-950 transition hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-300">
                <img src="/logo.svg" alt="Nexus Studios" className="size-5 shrink-0" />
                <span className="text-base font-medium">Nexus Studios</span>
            </Link>

            <button
                type="button"
                className="ml-3 inline-flex size-8 shrink-0 items-center justify-center text-stone-600 transition hover:text-stone-950 md:hidden dark:text-stone-300 dark:hover:text-white"
                onClick={onMenuClick}
                aria-label="打开导航菜单"
                title="导航菜单"
            >
                <Menu className="size-5" />
            </button>
        </div>
    );
}

function DesktopNavLinks({ activeToolSlug }: { activeToolSlug?: NavigationToolSlug }) {
    return (
        <nav className="hide-scrollbar ml-8 hidden h-16 min-w-0 items-center gap-7 overflow-x-auto md:flex">
            {navigationTools.map((tool) => {
                const Icon = tool.icon;
                const active = tool.slug === activeToolSlug;
                return (
                    <Link
                        key={tool.slug}
                        href={`/${tool.slug}`}
                        className={cn(
                            "relative flex h-16 shrink-0 items-center gap-2 text-sm leading-6 transition after:absolute after:inset-x-0 after:bottom-0 after:h-px",
                            active ? "font-medium text-stone-950 after:bg-stone-950 dark:text-stone-100 dark:after:bg-stone-100" : "text-stone-500 after:bg-transparent hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100",
                        )}
                    >
                        <Icon className="size-4" />
                        <span className="truncate">{tool.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export function AppTopNav() {
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const hideHeader = CANVAS_EDITOR_ROUTE.test(pathname);
    const activeToolSlug = getActiveToolSlug(pathname);
    const navRef = useFloatingNavState(pathname, hideHeader);

    return (
        <>
            {!hideHeader ? (
                <header ref={navRef} data-state="docked" className={styles.root}>
                    <div className={styles.surface}>
                        <div className="flex min-w-0 items-center">
                            <NavBrand onMenuClick={() => setMobileNavOpen(true)} />
                            <DesktopNavLinks activeToolSlug={activeToolSlug} />
                        </div>

                        <div className="my-auto flex h-9 min-w-0 items-center justify-end gap-2 whitespace-nowrap px-4 sm:px-5">
                            <UserStatusActions />
                        </div>
                    </div>
                </header>
            ) : null}

            <MobileNavDrawer open={mobileNavOpen} activeToolSlug={activeToolSlug} onClose={() => setMobileNavOpen(false)} />
            <AppConfigModal />
        </>
    );
}
