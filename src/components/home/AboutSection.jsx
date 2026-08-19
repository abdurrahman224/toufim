import React, { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IMG_ABOUT_1, IMG_ABOUT_2 } from './assets';

const useCountUp = (target, duration = 1800, active = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
};

const AboutSection = memo(() => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const count1 = useCountUp(250, 1800, started);
  const count2 = useCountUp(100, 1800, started);

  return (
    <section className='px-6 xl:px-20 py-16' ref={sectionRef}>
      <div className='container mx-auto'>
        <div className='relative bg-primary rounded-4xl p-10 xl:p-16 flex flex-col lg:flex-row gap-12 overflow-hidden'>
          {/* Decorative blur blob */}
          <div className='absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[rgba(255,255,255,0.1)] blur-[32px] pointer-events-none' />

          {/* Left: text content */}
          <div className='flex-1 flex flex-col gap-8 z-10'>
            <h2 className="font-['Work_Sans',sans-serif] font-black text-[40px] xl:text-5xl text-white leading-none tracking-[-0.5px]">
              {t('home.about.heading')}
            </h2>
            <p className="font-['Work_Sans',sans-serif] font-normal text-[rgba(255,255,255,0.8)] text-lg leading-7.25">
              {t('home.about.description')}
            </p>

            {/* Stats */}
            <div className='grid grid-cols-2 gap-8'>
              <div>
                <p className="font-['Work_Sans',sans-serif] font-black text-4xl text-white leading-none">
                  {count1}+
                </p>
                <p className="font-['Work_Sans',sans-serif] font-semibold text-[rgba(255,255,255,0.8)] text-[13px] uppercase tracking-[1px] mt-1">
                  {t('home.about.stat1')}
                </p>
              </div>
              <div>
                <p className="font-['Work_Sans',sans-serif] font-black text-4xl text-white leading-none">
                  {count2}%
                </p>
                <p className="font-['Work_Sans',sans-serif] font-semibold text-[rgba(255,255,255,0.8)] text-[13px] uppercase tracking-[1px] mt-1">
                  {t('home.about.stat2')}
                </p>
              </div>
            </div>
          </div>

          {/* Right: image grid */}
          <div className='flex-1 grid grid-cols-2 gap-4 z-10'>
            <img
              src='/IMG_ABOUT_1.webp'
              alt=''
              className='w-full aspect-3/4 object-cover rounded-2xl'
            />
            <img
              src='/IMG_ABOUT_2.webp'
              alt=''
              className='w-full aspect-3/4 object-cover rounded-2xl'
            />
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
