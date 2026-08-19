import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../config';
import { IMG_HERO, IMG_HERO_BADGE_ICON } from './assets';
import { Award } from 'lucide-react';

const HeroSection = memo(() => {
  const { t } = useTranslation();

  return (
    <section className='bg-surface px-6 xl:px-20 pt-10 pb-14'>
      <div className='container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        {/* Left column */}
        <div className='flex flex-col gap-8'>
          {/* Badge */}
          <div className='flex items-center gap-2 w-fit bg-[rgba(244,133,37,0.1)] border border-[rgba(244,133,37,0.2)] rounded-full px-4 py-2'>
            <span className='w-2 h-2 rounded-full bg-primary shrink-0' />
            <span className="font-['Work_Sans',sans-serif] font-semibold text-primary text-xs tracking-[1.2px] uppercase">
              {t('home.hero.badge')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-['Work_Sans',sans-serif] font-black text-[52px] xl:text-7xl leading-none tracking-[-1.8px] text-heading">
            {t('home.hero.headingLine1')}
            <br />
            {t('home.hero.headingLine2')}
            <br />
            {t('home.hero.headingLine3')}
          </h1>

          {/* Description */}
          <p className="font-['Work_Sans',sans-serif] font-bold text-body text-lg leading-7 max-w-lg">
            {t('home.hero.description')}
          </p>

          {/* CTA buttons */}
          <div className='flex flex-wrap items-center gap-4'>
            <Link
              to={ROUTES.CONTACT}
              className="btn font-['Work_Sans',sans-serif] font-bold text-lg text-white bg-primary rounded-xl px-8 py-3.5 shadow-[0_4px_24px_rgba(244,133,37,0.4)] hover:bg-[#e07418] transition-colors"
            >
              {t('home.hero.requestQuote')}
            </Link>
            <Link
              to={ROUTES.SERVICES}
              className="btn font-['Work_Sans',sans-serif] font-bold text-lg text-heading border border-border rounded-xl px-8 py-3.5 hover:border-primary transition-colors"
            >
              {t('home.hero.viewServices')}
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className='relative mt-8 lg:mt-0'>
          <img
            src='/IMG_HERO.webp'
            alt={t('home.hero.imageAlt')}
            className='w-full aspect-4/5 object-cover rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)]'
          />

          {/* "15+ Years Excellence" badge overlay */}
          <div className='absolute -bottom-6 left-4 lg:-left-6 bg-white border border-border rounded-2xl p-5 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]'>
           <samp className='bg-[#F485251A] p-2 text-[#F48525] rounded-lg'><Award size={ 28} /></samp>
           
            <div>
              <p className="font-['Work_Sans',sans-serif] font-black text-[22px] xl:text-2xl text-heading leading-none">
                15+
              </p>
              <p className="font-['Work_Sans',sans-serif] font-semibold text-[11px] xl:text-xs text-muted uppercase tracking-[1px] mt-0.5">
                {t('home.hero.yearsExcellence')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
