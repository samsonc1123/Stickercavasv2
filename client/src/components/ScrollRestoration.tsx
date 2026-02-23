import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const KEY = (path: string) => `scroll:${path}`;

function getSaved(path: string) {
  const v = localStorage.getItem(KEY(path));
  return v ? Math.max(0, parseInt(v, 10)) : 0;
}

function save(path: string, y: number) {
  try {
    localStorage.setItem(KEY(path), String(Math.max(0, Math.floor(y))));
  } catch {}
}

export default function ScrollRestoration() {
  const [path] = useLocation();
  const ticking = useRef(false);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        save(path, window.scrollY);
        ticking.current = false;
      });
    };

    const onBeforeUnload = () => save(path, window.scrollY);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save(path, window.scrollY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [path]);

  useEffect(() => {
    if (lastPath.current && lastPath.current !== path) {
      const currentY = window.scrollY;
      save(lastPath.current, currentY);
      console.log(`[ScrollRestore] Saved ${lastPath.current} position: ${currentY}`);
    }
    lastPath.current = path;

    const y = getSaved(path);
    console.log(`[ScrollRestore] Restoring ${path} to position: ${y}`);

    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: "auto" });
      console.log(`[ScrollRestore] Set scroll to ${y}, actual: ${window.scrollY}`);
    });
    const t = setTimeout(() => {
      if (Math.abs(window.scrollY - y) > 2) {
        console.log(`[ScrollRestore] Safety restore: ${y} (was at ${window.scrollY})`);
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      }
    }, 60);

    return () => clearTimeout(t);
  }, [path]);

  return null;
}
