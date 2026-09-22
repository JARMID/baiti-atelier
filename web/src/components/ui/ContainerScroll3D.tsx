import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useConfigStore } from '../../store/configStore';

interface ContainerScroll3DProps {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  badgeText?: string;
}

export const ContainerScroll3D: React.FC<ContainerScroll3DProps> = ({
  titleComponent,
  children,
  badgeText,
}) => {
  const { theme } = useConfigStore();
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 3D rotations and perspective shifts linked to scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 0.8], isMobile ? [10, 0, 0] : [18, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 0.8], isMobile ? [0.92, 1, 0.98] : [0.94, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.7]);
  const translateHeader = useTransform(scrollYProgress, [0, 0.35], [40, 0]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Optional Top Badge & Title Header */}
      <motion.div
        style={{ y: translateHeader, opacity }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        {badgeText && (
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono mb-4 backdrop-blur-md ${
            isLight
              ? 'bg-white border-slate-200 text-slate-700 shadow-xs'
              : 'bg-white/5 border-white/10 text-zinc-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>{badgeText}</span>
          </div>
        )}
        {titleComponent}
      </motion.div>

      {/* 3D Perspective Canvas & Stage */}
      <div
        className="w-full relative"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          style={{
            rotateX,
            scale,
            opacity,
            transformStyle: 'preserve-3d',
          }}
          className={`w-full rounded-3xl border backdrop-blur-2xl p-3 sm:p-6 transition-colors duration-300 ${
            isLight
              ? 'border-slate-300/80 bg-gradient-to-b from-white to-slate-50/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1),0_0_30px_rgba(212,175,55,0.08)]'
              : 'border-white/10 bg-gradient-to-b from-[#0F141C]/90 to-[#080A0E]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(212,175,55,0.12)]'
          }`}
        >
          {/* Subtle Ambient Rim Light */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent pointer-events-none" />
          
          {children}
        </motion.div>
      </div>
    </div>
  );
};
