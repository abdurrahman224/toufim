import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { House, Spotlight, Wrench } from 'lucide-react';
import {
  IMG_SERVICE_ICON_1,
  IMG_SERVICE_ICON_2,
  IMG_SERVICE_ICON_3,
  IMG_ARROW_SMALL,
} from './assets';

const SERVICE_ICON_MAP = {
  icon1: IMG_SERVICE_ICON_1,
  icon2: IMG_SERVICE_ICON_2,
  icon3: IMG_SERVICE_ICON_3,
};

const SERVICE_ITEMS = [
  {
    iconKey: 'icon1',
    IconComponent: House,
    titleKey: 'home.services.item1.title',
    descKey: 'home.services.item1.description',
  },
  {
    iconKey: 'icon2',
    IconComponent: Wrench,
    titleKey: 'home.services.item2.title',
    descKey: 'home.services.item2.description',
  },
  {
    iconKey: 'icon3',
    IconComponent: Spotlight,
    titleKey: 'home.services.item3.title',
    descKey: 'home.services.item3.description',
  },
];

const ServiceCard = memo(({ iconSrc, IconComponent, title, description, learnMore }) => (
  <div className='flex-1 bg-surface rounded-2xl px-10 xl:px-14 py-9 flex flex-col gap-4'>
    <div className='bg-[#F485251A] text-[#F48525] rounded-xl w-14 h-14 flex items-center justify-center shrink-0'>
      {IconComponent
        ? <IconComponent className='w-7 h-7' />
        : <img src={iconSrc} alt='' className='w-7 h-7' />}
    </div>
    <h3 className="font-['Work_Sans',sans-serif] font-bold text-xl text-heading">
      {title}
    </h3>
    <p className="font-['Work_Sans',sans-serif] font-normal text-body text-base leading-6.5 flex-1">
      {description}
    </p>
    <button
      type='button'
      className="font-['Work_Sans',sans-serif] font-semibold text-primary text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all self-start cursor-pointer"
    >
      {learnMore}
      <img src={IMG_ARROW_SMALL} alt='' className='w-3.5 h-3.5' />
    </button>
  </div>
));

ServiceCard.displayName = 'ServiceCard';

const ServicesSection = memo(() => {
  const { t } = useTranslation();

  return (
    <section className='bg-white px-6 xl:px-20 py-20'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='flex flex-col items-center gap-3 mb-14'>
          <span className="font-['Work_Sans',sans-serif] font-bold text-primary text-sm uppercase tracking-[1.4px]">
            {t('home.services.label')}
          </span>
          <h2 className="font-['Work_Sans',sans-serif] font-black text-[40px] xl:text-5xl text-heading text-center tracking-[-0.5px]">
            {t('home.services.title')}
          </h2>
          <p className="font-['Work_Sans',sans-serif] font-normal text-body text-base text-center max-w-165">
            {t('home.services.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {SERVICE_ITEMS.map(({ iconKey, IconComponent, titleKey, descKey }) => (
            <ServiceCard
              key={iconKey}
              iconSrc={SERVICE_ICON_MAP[iconKey]}
              IconComponent={IconComponent}
              title={t(titleKey)}
              description={t(descKey)}
              learnMore={t('home.services.learnMore')}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection;
