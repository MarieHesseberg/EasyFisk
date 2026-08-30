"use client";

import { useEffect, useRef, useState } from "react";

interface ThumbPosition {
  height: number;
  top: number;
  visible: boolean;
}

const thumbHeight = 64;
const initialPosition: ThumbPosition = { height: thumbHeight, top: 0, visible: false };

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
      const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
      const availableDistance = Math.max(0, marker.current!.clientHeight - thumbHeight);
      setThumb({ height: thumbHeight, top: progress * availableDistance, visible: true });
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
      <i style={{ height: `${thumb.height}px`, top: `${thumb.top}px` }} />
    </div>
  );
}
