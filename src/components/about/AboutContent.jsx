import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AnnouncementBar from '../home/AnnouncementBar';
import HomeNav from '../home/HomeNav';
import FooterSection from '../home/FooterSection';
import { ROUTES } from '../../config';
import {
  IMG_ABOUT_HERO_CONSTRUCTION,
  IMG_ABOUT_VISION_ICON,
  IMG_ABOUT_MISSION_ICON,
} from '../home/assets';
import { BadgeCheck, Eye, Handshake, History, Rocket, Scale, ShieldCheck } from 'lucide-react';

const VALUE_CARDS = [
  {
    Icon: BadgeCheck,
    titleKey: 'qualityTitle',
    descKey: 'qualityDesc',
  },
  {
    Icon: Handshake,
    titleKey: 'integrityTitle',
    descKey: 'integrityDesc',
  },
  {
    Icon: History ,
    titleKey: 'reliabilityTitle',
    descKey: 'reliabilityDesc',
  },
];

const AboutContent = memo(() => {
  const { t } = useTranslation();

  return (
    <div className='bg-surfacein-h-screen'>
      <AnnouncementBar />
      <HomeNav />

      {/* ── Hero + Story/Mission ──────────────────────────────────────── */}
      <section className='px-6 xl:px-20 py-10'>
        <div className='container mx-auto flex flex-col gap-12'>
          {/* Hero image */}
          <div className='relative h-52 sm:h-72 lg:h-100 rounded-xl overflow-hidden'>
            <img
              src='IMG_ABOUT_HERO_CONSTRUCTION.webp'
              alt='EliteBuild bouw'
              className='absolute inset-0 w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-linear-to-t from-[rgba(34,24,16,0.8)] to-[rgba(34,24,16,0)]' />
            <div className='absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-10 lg:left-10 lg:right-auto lg:max-w-2xl flex flex-col gap-3 lg:gap-4'>
              <h1 className="font-['Work_Sans',sans-serif] font-black text-2xl sm:text-4xl lg:text-6xl text-white leading-tight lg:leading-15">
                {t('about.heroHeadingLine1')}
                <br />
                {t('about.heroHeadingLine2')}
              </h1>
              <p className="font-['Work_Sans',sans-serif] font-medium text-base text-border leading-relaxed lg:text-xl lg:leading-7">
                {t('about.heroSubtitle')}
              </p>
            </div>
          </div>

          {/* Story & Mission — 2-col grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center'>
            {/* Left: story text */}
            <div className='flex flex-col gap-6'>
              <p className="font-['Work_Sans',sans-serif] font-bold text-xs sm:text-sm text-primary tracking-[1.4px] uppercase leading-5">
                {t('about.heritageLabel')}
              </p>
              <h2 className="font-['Work_Sans',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-heading leading-tight lg:leading-10">
                {t('about.storyHeadingLine1')}
                <br />
                {t('about.storyHeadingLine2')}
              </h2>
              <p className="font-['Work_Sans',sans-serif] font-normal text-base text-body leading-relaxed lg:text-lg lg:leading-7.25">
                {t('about.storyParagraph1')}
              </p>
              <p className="font-['Work_Sans',sans-serif] font-normal text-base text-body leading-relaxed lg:text-lg lg:leading-7.25">
                {t('about.storyParagraph2')}
              </p>
            </div>

            {/* Right: vision + mission card */}
            <div className='bg-[rgba(244,133,37,0.05)] border border-[rgba(244,133,37,0.2)] rounded-xl p-8.25 flex flex-col gap-8'>
              {/* Vision */}
              <div className='flex gap-4 items-start'>
                {/* <img
                  src={IMG_ABOUT_VISION_ICON}
                  alt=''
                  className='w-11.5 h-9.75 object-contain shrink-0 mt-1'
                /> */}
               <div className='bg-[#F48525] p-4 rounded-xl'> <samp className=' text-white'><Eye  /></samp></div>
                <div className='flex flex-col gap-2'>
                  <h3 className="font-['Work_Sans',sans-serif] font-bold text-xl text-heading leading-7">
                    {t('about.visionTitle')}
                  </h3>
                  <p className="font-['Work_Sans',sans-serif] font-normal text-base text-body leading-6">
                    {t('about.visionDesc')}
                  </p>
                </div>
              </div>
              {/* Mission */}
              <div className='flex gap-4 items-start'>
                {/* <img
                  src={IMG_ABOUT_MISSION_ICON}
                  alt=''
                  className='w-11 h-11 object-contain shrink-0 mt-1'
                /> */}
                               <div className='bg-[#F48525] p-4 rounded-xl'> <samp className=' text-white'><Rocket /></samp></div>

                <div className='flex flex-col gap-2'>
                  <h3 className="font-['Work_Sans',sans-serif] font-bold text-xl text-heading leading-7">
                    {t('about.missionTitle')}
                  </h3>
                  <p className="font-['Work_Sans',sans-serif] font-normal text-base text-body leading-6">
                    {t('about.missionDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ──────────────────────────────────────────────── */}
      <section className='bg-[rgba(244,133,37,0.05)] py-12 sm:py-14 lg:py-16 pb-10'>
        <div className='container mx-auto px-6 xl:px-20 flex flex-col gap-10 lg:gap-16'>
          {/* Section header */}
          <div className='flex flex-col gap-3 items-center'>
            <p className="font-['Work_Sans',sans-serif] font-bold text-xs sm:text-sm text-primary tracking-[1.4px] uppercase leading-5 text-center">
              {t('about.valuesLabel')}
            </p>
            <h2 className="font-['Work_Sans',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl text-heading leading-tight lg:leading-10 text-center">
              {t('about.valuesHeading')}
            </h2>
          </div>

          {/* 3 value cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
            {VALUE_CARDS.map(({ Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className='bg-white border border-[rgba(244,133,37,0.1)] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col items-center px-4 sm:px-6 pt-8 sm:pt-10 pb-8 sm:pb-0 sm:h-79.5'
              >
                <div className=''>
                  <Icon size={24} className='text-primary' />
                </div>
                <h3 className="mt-6 sm:mt-7 font-['Work_Sans',sans-serif] font-bold text-lg sm:text-xl text-heading leading-7 text-center">
                  {t(`about.${titleKey}`)}
                </h3>
                <p className="mt-3 sm:mt-4 font-['Work_Sans',sans-serif] font-normal text-base text-body leading-6 text-center">
                  {t(`about.${descKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────── */}
      <section className='bg-heading py-12 sm:py-16 lg:py-20 px-6 xl:px-20'>
        <div className='max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8'>
          <h2 className="font-['Work_Sans',sans-serif] font-black text-2xl sm:text-4xl lg:text-5xl text-white leading-tight text-center lg:whitespace-nowrap">
            {t('about.ctaHeading')}
          </h2>
          <p className="font-['Work_Sans',sans-serif] font-normal text-base text-subtle leading-relaxed lg:text-xl lg:leading-7 text-center">
            {t('about.ctaSubtitle')}
          </p>
          <div className='flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center pt-4'>
            <Link
              to={ROUTES.CONTACT}
              className="btn bg-primary hover:bg-primary-700 transition-colors w-full sm:w-auto text-center px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-['Work_Sans',sans-serif] font-bold text-base text-white leading-6 shadow-[0_20px_25px_-5px_rgba(244,133,37,0.2),0_8px_10px_-6px_rgba(244,133,37,0.2)]"
            >
              {t('about.ctaContactBtn')}
            </Link>
            <Link
              to={ROUTES.SERVICES}
              className="btn bg-form-label hover:bg-[#3e4e63] transition-colors w-full sm:w-auto text-center px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-['Work_Sans',sans-serif] font-bold text-base text-white leading-6"
            >
              {t('about.ctaPortfolioBtn')}
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
});

AboutContent.displayName = 'AboutContent';

export default AboutContent;
