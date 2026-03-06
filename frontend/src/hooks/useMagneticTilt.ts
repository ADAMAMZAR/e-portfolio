import { useCallback, useRef, type MouseEvent } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function useMagneticTilt(strength = 15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(x, { stiffness: 300, damping: 30 });

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const nextX = ((event.clientX - centerX) / (rect.width / 2)) * strength;
      const nextY = ((event.clientY - centerY) / (rect.height / 2)) * -strength;

      x.set(nextX);
      y.set(nextY);
    },
    [prefersReducedMotion, strength, x, y]
  );

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave, prefersReducedMotion };
}

