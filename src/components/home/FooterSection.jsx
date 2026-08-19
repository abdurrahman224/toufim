import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Link2, AtSign, MapPin, Phone, Mail } from 'lucide-react';
import { ROUTES } from '../../config';
import {
  IMG_FOOTER_LOGO,
  IMG_LOCATION_PIN,
  IMG_PHONE,
  IMG_EMAIL,
} from './assets';

const FOOTER_NAV_LINKS = [
  { key: 'home.footer.nav.residential', to: ROUTES.SERVICES },
  { key: 'home.footer.nav.commercial', to: ROUTES.SERVICES },
  { key: 'home.footer.nav.portfolio', to: '#' },
  { key: 'home.footer.nav.portal', to: ROUTES.LOGIN },
  { key: 'home.footer.nav.careers', to: '#' },
];

const SOCIAL_LINKS = [
  { icon: Share2, alt: 'Share', href: '#' },
  { icon: Link2, alt: 'Link', href: '#' },
  { icon: AtSign, alt: 'Email', href: '#' },
];

const FooterSection = memo(() => {
  const { t } = useTranslation();

  return (
    <footer className='bg-footer-bg border-t border-[rgba(255,255,255,0.05)]'>
      <div className='container mx-auto px-6 xl:px-20 pt-20 pb-10'>
        {/* 4-column grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 mb-12'>
          {/* Col 1: Branding */}
          <div className='flex flex-col gap-5'>
            <div>
              
              <img
                src='/logo.webp'
                alt='EliteBuild'
                className='w-38 h-auto object-contain object-left -mt-4'
              />
            </div>
            <p className="font-['Work_Sans',sans-serif] font-normal text-subtle text-sm leading-5.5">
              {t('home.footer.tagline')}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className='flex flex-col gap-6'>
            <h5 className="font-['Work_Sans',sans-serif] font-bold text-white text-[13px] uppercase tracking-[1.8px]">
              {t('home.footer.navHeading')}
            </h5>
            <nav className='flex flex-col gap-3'>
              {FOOTER_NAV_LINKS.map(({ key, to }) => (
                <Link
                  key={key}
                  to={to}
                  className="font-['Work_Sans',sans-serif] font-normal text-subtle text-sm hover:text-white transition-colors"
                >
                  {t(key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3: Contact Info */}
          <div className='flex flex-col gap-6'>
            <h5 className="font-['Work_Sans',sans-serif] font-bold text-white text-[13px] uppercase tracking-[1.8px]">
              {t('home.footer.contactHeading')}
            </h5>
            <div className='flex flex-col gap-4'>
              <div className='flex gap-3 items-start'>
                {/* <img
                  src={IMG_LOCATION_PIN}
                  alt=''
                  className='w-4.5 h-4.5 shrink-0 mt-px'
                /> */}
            
                   <span className='text-[#F48525]'><MapPin /></span>
                <p className="font-['Work_Sans',sans-serif] font-normal text-subtle text-sm leading-5">
                  100 Construction Way,
                  <br />
                  Suite 500, Chicago, IL 60601
                </p>
              </div>
              <div className='flex gap-3 items-center'>
                {/* <img src={IMG_PHONE} alt='' className='w-4.5 h-4.5 shrink-0' /> */}
                
                   <span className='text-[#F48525]'><Phone /> </span>
                <p className="font-['Work_Sans',sans-serif] font-normal text-subtle text-sm">
                  +1 (800) 555-0199
                </p>
              </div>
              <div className='flex gap-3 items-center'>
                {/* <img src={IMG_EMAIL} alt='' className='w-4.5 h-4 shrink-0' /> */}
                <span className='text-[#F48525]'><Mail /></span>
                <p className="font-['Work_Sans',sans-serif] font-normal text-subtle text-sm">
                  hallo@elitebuild.com
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Social Media */}
          <div className='flex flex-col gap-6'>
            <h5 className="font-['Work_Sans',sans-serif] font-bold text-white text-[13px] uppercase tracking-[1.8px]">
              {t('home.footer.socialHeading')}
            </h5>
            <div className='flex gap-2.5'>
              {SOCIAL_LINKS.map(({ icon: Icon, alt, href }) => (
                <a
                  key={alt}
                  href={href}
                  aria-label={alt}
                  rel='noopener noreferrer'
                  className='group w-10 h-10 bg-[rgba(255,255,255,0.05)] rounded-lg flex items-center justify-center hover:bg-[rgba(244,133,37,0.15)] transition-colors'
                >
                  <Icon
                    size={16}
                    className='text-subtle group-hover:text-primary transition-colors'
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='border-t border-[rgba(255,255,255,0.05)] mt-0 pt-8 pb-2 flex flex-row flex-wrap items-center justify-between gap-4'>
          <p className="font-['Work_Sans',sans-serif] font-bold text-subtle text-xs uppercase tracking-[1.2px]">
            {t('home.footer.copyright')}
          </p>
          <div className='flex gap-8'>
            <a
              href='#'
              className="font-['Work_Sans',sans-serif] font-bold text-subtle text-xs uppercase tracking-[1.2px] hover:text-white transition-colors"
            >
              {t('home.footer.privacy')}
            </a>
            <a
              href='#'
              className="font-['Work_Sans',sans-serif] font-bold text-subtle text-xs uppercase tracking-[1.2px] hover:text-white transition-colors"
            >
              {t('home.footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = 'FooterSection';

export default FooterSection;
