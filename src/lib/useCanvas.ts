'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * 通用 Canvas Hook
 * 自动处理 DPR 缩放和容器尺寸
 * 用法：const { canvasRef, width, height } = useCanvas(drawCallback, [deps]);
 */
export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: React.DependencyList = []
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    if (w === 0 || h === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    sizeRef.current = { w, h };
    draw(ctx, w, h);
  }, [draw, ...deps]);

  useEffect(() => {
    // 初始绘制
    const timer = setTimeout(redraw, 50);

    // 监听窗口变化
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [redraw]);

  return { canvasRef, ...sizeRef.current };
}
