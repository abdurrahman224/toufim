import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IMG_GALLERY_BEFORE_1,
  IMG_GALLERY_AFTER_1,
  IMG_GALLERY_BEFORE_2,
  IMG_GALLERY_AFTER_2,
} from './assets';

const PORTFOLIO_ITEMS = [
  {
    id: 'item1',
    beforeSrc: IMG_GALLERY_BEFORE_1,
    afterSrc: IMG_GALLERY_AFTER_1,
    titleKey: 'home.portfolio.item1.title',
    subtitleKey: 'home.portfolio.item1.subtitle',
  },
  {
    id: 'item2',
    beforeSrc: IMG_GALLERY_BEFORE_2,
    afterSrc: IMG_GALLERY_AFTER_2,
    titleKey: 'home.portfolio.item2.title',
    subtitleKey: 'home.portfolio.item2.subtitle',
  },
];

const PortfolioCard = memo(
  ({ beforeSrc, afterSrc, title, subtitle, beforeLabel, afterLabel }) => (
    <div className='flex-1 flex flex-col gap-6'>
      <div className='grid grid-cols-2 gap-2 h-90 xl:h-100 rounded-4xl overflow-hidden'>
        <div className='relative'>
          <img
            src='/Container.webp'
            alt='Before'
            className='w-full h-full object-cover'
          />
          <span className="absolute top-4 left-4 bg-[rgba(0,0,0,0.5)] rounded px-3 py-1 font-['Work_Sans',sans-serif] font-semibold text-white text-[11px] uppercase tracking-[1px]">
            {beforeLabel}
          </span>
        </div>
        <div className='relative'>
          <img
            src='/Container2.webp'
            alt='After'
            className='w-full h-full object-cover'
          />
          <span className="absolute top-4 left-4 bg-primary rounded px-3 py-1 font-['Work_Sans',sans-serif] font-semibold text-white text-[11px] uppercase tracking-[1px]">
            {afterLabel}
          </span>
        </div>
      </div>
      <div>
        <h3 className="font-['Work_Sans',sans-serif] font-bold text-2xl text-heading">
          {title}
        </h3>
        <p className="font-['Work_Sans',sans-serif] font-medium text-muted text-base mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  ),
);

PortfolioCard.displayName = 'PortfolioCard';

const PortfolioSection = memo(() => {
  const { t } = useTranslation();

  return (
    <section className='bg-surface px-6 xl:px-20 py-24'>
      <div className='container mx-auto'>
        {/* Header row */}
        <div className='flex items-end justify-between mb-12 gap-4'>
          <div className='flex flex-col gap-2'>
            <span className="font-['Work_Sans',sans-serif] font-bold text-primary text-sm uppercase tracking-[1.4px]">
              {t('home.portfolio.label')}
            </span>
            <h2 className="font-['Work_Sans',sans-serif] font-black text-[32px] xl:text-4xl text-heading tracking-[-0.5px]">
              {t('home.portfolio.title')}
            </h2>
          </div>
          {/* <button
            type='button'
            className="shrink-0 font-['Work_Sans',sans-serif] font-semibold text-primary text-sm hover:underline"
          >
            {t('home.portfolio.viewAll')}
          </button> */}
        </div>

        {/* Cards */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {PORTFOLIO_ITEMS.map(
            ({ id, beforeSrc, afterSrc, titleKey, subtitleKey }) => (
              <PortfolioCard
                key={id}
                beforeSrc={beforeSrc}
                afterSrc={afterSrc}
                title={t(titleKey)}
                subtitle={t(subtitleKey)}
                beforeLabel={t('home.portfolio.before')}
                afterLabel={t('home.portfolio.after')}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
});

PortfolioSection.displayName = 'PortfolioSection';

export default PortfolioSection;
