// Small motion helpers used across the site: count-up numbers and a typewriter headline.
// All of them stand still for visitors who asked their device for reduced motion.

import React, { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// true once the element has scrolled into view (and stays true)
export function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

// "96%" / "60K+" / "25+" — counts up to the number when it scrolls into view
export function CountUp({ value, duration = 1600, className = '' }) {
  const match = String(value).match(/^([\d.,]+)(.*)$/);
  const target = match ? Number(match[1].replace(/,/g, '')) : NaN;
  const suffix = match ? match[2] : '';
  const [ref, seen] = useInView(0.4);
  const [current, setCurrent] = useState(prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (!seen || !Number.isFinite(target) || prefersReducedMotion()) {
      if (seen) setCurrent(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setCurrent(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target, duration]);

  if (!Number.isFinite(target)) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {Math.round(current)}
      {suffix}
    </span>
  );
}

// Types a word, holds it, deletes it, then types the next one — with a blinking cursor
export function Typewriter({ words, className = '' }) {
  const [text, setText] = useState(prefersReducedMotion() ? words[0] : '');

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let index = 0;
    let length = 0;
    let deleting = false;
    let timer;
    const step = () => {
      const word = words[index];
      if (!deleting) {
        length += 1;
        setText(word.slice(0, length));
        if (length === word.length) {
          deleting = true;
          timer = setTimeout(step, 1700);
          return;
        }
        timer = setTimeout(step, 85);
      } else {
        length -= 1;
        setText(word.slice(0, length));
        if (length === 0) {
          deleting = false;
          index = (index + 1) % words.length;
          timer = setTimeout(step, 350);
          return;
        }
        timer = setTimeout(step, 45);
      }
    };
    timer = setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, [words]);

  return (
    <span className={className}>
      {text}
      <span className="zg-cursor" aria-hidden="true" />
    </span>
  );
}
