import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  IMG_TESTIMONIAL_1,
  IMG_TESTIMONIAL_2,
  IMG_TESTIMONIAL_3,
} from './assets';

const TESTIMONIALS = [
  {
    id: 'item1',
    nameKey: 'home.testimonials.item1.name',
    roleKey: 'home.testimonials.item1.role',
    quoteKey: 'home.testimonials.item1.quote',
    imgSrc: '/IMG_TESTIMONIAL_1.webp',
    featured: false,
  },
  {
    id: 'item2',
    nameKey: 'home.testimonials.item2.name',
    roleKey: 'home.testimonials.item2.role',
    quoteKey: 'home.testimonials.item2.quote',
    imgSrc: "/IMG_TESTIMONIAL_2.webp",
    featured: true,
  },
  {
    id: 'item3',
    nameKey: 'home.testimonials.item3.name',
    roleKey: 'home.testimonials.item3.role',
    quoteKey: 'home.testimonials.item3.quote',
    imgSrc: '/IMG_TESTIMONIAL_3.webp',
    featured: false,
  },
];

const STARS = [0, 1, 2, 3, 4];

const TestimonialCard = memo(({ name, role, quote, imgSrc, featured }) => (
  <div
    className={`flex-1 rounded-3xl p-8 flex flex-col gap-5 ${
      featured
        ? 'bg-primary lg:scale-105'
        : 'bg-surface border border-[#f1f5f9]'
    }`}
  >
    {/* Stars */}
    <div className='flex gap-1'>
      {STARS.map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${featured ? 'text-white' : 'text-primary'}`}
          fill='currentColor'
        />
      ))}
    </div>

    {/* Quote */}
    <p
      className={`font-['Work_Sans',sans-serif] font-medium text-lg leading-7.25 flex-1 ${
        featured ? 'text-white' : 'text-heading'
      }`}
    >
      "{quote}"
    </p>

    {/* Reviewer */}
    <div className='flex items-center gap-3'>
      <img
        src={imgSrc}
        alt={name}
        className='w-12 h-12 rounded-full object-cover shrink-0'
      />
      <div>
        <p
          className={`font-['Work_Sans',sans-serif] font-bold text-base ${
            featured ? 'text-white' : 'text-heading'
          }`}
        >
          {name}
        </p>
        <p
          className={`font-['Work_Sans',sans-serif] font-normal text-xs ${
            featured ? 'text-[rgba(255,255,255,0.8)]' : 'text-muted'
          }`}
        >
          {role}
        </p>
      </div>
    </div>
  </div>
));

TestimonialCard.displayName = 'TestimonialCard';

const TestimonialsSection = memo(() => {
  const { t } = useTranslation();

  return (
    <section className='bg-white px-6 xl:px-20 py-20'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='flex flex-col items-center gap-3 mb-14'>
          <span className="font-['Work_Sans',sans-serif] font-bold text-primary text-sm uppercase tracking-[1.4px]">
            {t('home.testimonials.label')}
          </span>
          <h2 className="font-['Work_Sans',sans-serif] font-black text-[32px] xl:text-4xl text-heading text-center tracking-[-0.5px]">
            {t('home.testimonials.title')}
          </h2>
        </div>

        {/* Cards */}
        <div className='flex flex-col lg:flex-row gap-6 lg:items-stretch'>
          {TESTIMONIALS.map(
            ({ id, nameKey, roleKey, quoteKey, imgSrc, featured }) => (
              <TestimonialCard
                key={id}
                name={t(nameKey)}
                role={t(roleKey)}
                quote={t(quoteKey)}
                imgSrc={imgSrc}
                featured={featured}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';

export default TestimonialsSection;
