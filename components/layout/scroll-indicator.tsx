"use client";

import { useEffect, useRef, useState } from "react";

interface ThumbPosition {
  height: number;
  top: number;
  visible: boolean;
}

const initialPosition: ThumbPosition = { height: 100, top: 0, visible: false };

export function ScrollIndicator() {
  const marker = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState(initialPosition);

  useEffect(() => {
    const shell = marker.current?.parentElement;
    if (!shell) return;
    let frame = 0;

    function measure() {
      if (!shell) return;
      const candidates = shell.querySelectorAll<HTMLElement>(
        ".screen, .detail-page, .flow-sheet, .catch-modal",
      );
      const target = [...candidates].findLast(
        (element) => element.offsetParent !== null && element.clientHeight > 0,
      );
      if (!target || target.scrollHeight <= target.clientHeight + 2) {
        setThumb(initialPosition);
        return;
      }
      const height = Math.max(12, (target.clientHeight / target.scrollHeight) * 100);
      const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
      setThumb({ height, top: progress * (100 - height), visible: true });
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
    <div
      ref={marker}
      className={`scroll-indicator ${thumb.visible ? "visible" : ""}`}
      aria-hidden="true"
    >
      <i style={{ height: `${thumb.height}%`, top: `${thumb.top}%` }} />
    </div>
  );
}
