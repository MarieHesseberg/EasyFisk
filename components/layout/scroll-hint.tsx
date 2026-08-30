"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollHint() {
  const marker = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shell = marker.current?.parentElement;
    if (!shell) return;
    let frame = 0;
    function measure() {
      if (!shell) return;
      const dialog = shell.querySelector(".catch-modal, .flow-overlay");
      const pages = shell.querySelectorAll<HTMLElement>(".screen, .detail-page");
      const page = pages[pages.length - 1];
      target.current = page ?? null;
      setVisible(!dialog && !!page && page.scrollHeight - page.clientHeight - page.scrollTop > 24);
    }
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(shell);
    const changes = new MutationObserver(schedule);
    changes.observe(shell, { childList: true, subtree: true });
    shell.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      changes.disconnect();
      shell.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={marker} className="scroll-hint-container">
      {visible && (
        <button
          className="scroll-hint"
          onClick={() => {
            const page = target.current;
            page?.scrollBy({
              top: page.clientHeight * 0.65,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            });
          }}
        >
          Mer nedenfor <span aria-hidden="true">↓</span>
        </button>
      )}
    </div>
  );
}
