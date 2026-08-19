import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import AnnouncementBar from '../home/AnnouncementBar';
import HomeNav from '../home/HomeNav';
import FooterSection from '../home/FooterSection';
import { ROUTES } from '../../config';
import {
  IMG_DETAIL_STEPS_DIVIDER,
  IMG_DETAIL_STAR,
  IMG_DETAIL_CHECK,
} from '../home/assets';
import { PcCase } from 'lucide-react';
import {
  fetchServiceById,
  selectServiceDetail,
  selectServiceDetailStatus,
  selectServiceDetailError,
} from '../../store/slices/servicesSlice';

const STEPS = [
  { num: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
  { num: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
  { num: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
  { num: '4', titleKey: 'step4Title', descKey: 'step4Desc' },
];

const WHY_KEYS = ['why1', 'why2', 'why3'];

const StarRow = memo(() => (
  <div className='flex gap-1 items-center'>
    {[1, 2, 3, 4, 5].map((i) => (
      <img key={i} src={IMG_DETAIL_STAR} alt='' className='size-3 block' />
    ))}
  </div>
));
StarRow.displayName = 'StarRow';

const resolveImageSrc = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('data:')) {
    return imagePath;
  }

  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return baseUrl ? `${baseUrl}${normalized}` : normalized;
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(numericValue);
  }

  return String(value);
};

const ServiceDetailContent = memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const service = useSelector(selectServiceDetail);
  const status = useSelector(selectServiceDetailStatus);
  const error = useSelector(selectServiceDetailError);

  useEffect(() => {
    if (id) {
      dispatch(fetchServiceById(id));
    }
  }, [dispatch, id]);

  const heroImage = resolveImageSrc(service?.bannerImage);
  const gallery = (service?.galleryImages || []).filter(Boolean);
  const galleryBefore = resolveImageSrc(gallery[0]);
  const galleryAfter = resolveImageSrc(gallery[1]);
  const hasGallery = Boolean(galleryBefore || galleryAfter);
  const priceText = formatPrice(service?.basePrice);

  return (
    <div className='bg-surface min-h-screen'>
      <AnnouncementBar />
      <HomeNav />

      <main className='px-4 sm:px-6 md:px-10 xl:px-20 pt-6 pb-16 sm:pb-20'>
        <div className='container mx-auto'>
          {/* ── Hero Banner ──────────────────────────────────────────── */}
          <div className='mb-6 sm:mb-8'>
            <div className='overflow-hidden rounded-2xl relative'>
              {/* Background photo */}
              {heroImage ? (
                <img
                  src={heroImage}
                  alt=''
                  className='absolute inset-0 w-full h-full object-cover'
                />
              ) : null}
              {/* Dark gradient overlay */}
              <div className='absolute inset-0 bg-linear-to-r from-[rgba(0,0,0,0.85)] via-[rgba(0,0,0,0.55)] to-[rgba(0,0,0,0.15)]' />

              {/* Centered text */}
              <div className='relative z-10 p-5 sm:p-8 xl:p-10 min-h-64 sm:min-h-72 md:min-h-90 xl:min-h-115 flex flex-col justify-center gap-3'>
                {/* Category tag */}
                {service?.category ? (
                  <div className='bg-[rgba(30,30,30,0.75)] border border-[rgba(255,255,255,0.15)] px-3 py-1 rounded-full self-start backdrop-blur-sm'>
                    <span className="font-['Work_Sans',sans-serif] font-semibold text-xs text-white tracking-widest uppercase">
                      {service.category}
                    </span>
                  </div>
                ) : null}

                {/* Heading */}
                <h1 className="font-['Work_Sans',sans-serif] font-bold text-2xl sm:text-3xl xl:text-4xl text-white leading-tight max-w-xs sm:max-w-sm md:max-w-lg xl:max-w-2xl">
                  {service?.name || ''}
                </h1>

                {/* Sub-description */}
                <p className="font-['Work_Sans',sans-serif] font-normal text-[rgba(255,255,255,0.75)] text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-lg xl:max-w-2xl">
                  {service?.description || ''}
                </p>

                {/* CTA buttons */}
                <div className='flex flex-wrap items-center gap-3 pt-1'>
                  <a
                    href='https://wa.me/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className="btn inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] transition-colors rounded-lg px-4 sm:px-5 py-2.5 font-['Work_Sans',sans-serif] font-bold text-white text-sm"
                  >
                    <svg
                      viewBox='0 0 48 48'
                      version='1.1'
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-4 h-4'
                      aria-hidden='true'
                      focusable='false'
                    >
                      <g fill='none' fillRule='evenodd'>
                        <g
                          transform='translate(-700.000000, -360.000000)'
                          fill='currentColor'
                        >
                          <path d='M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z' />
                        </g>
                      </g>
                    </svg>
                    {t('serviceDetail.ctaWhatsapp')}
                  </a>
                  <Link
                    to={ROUTES.CONTACT}
                    className="btn inline-flex items-center gap-2 bg-primary hover:bg-[#e07418] transition-colors rounded-lg px-4 sm:px-5 py-2.5 font-['Work_Sans',sans-serif] font-bold text-white text-sm"
                  >
                    <samp><PcCase /></samp>
                    {t('serviceDetail.ctaQuote')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Overview + Sidebar (2/3 + 1/3 grid) ─────────────────── */}
          {status === 'loading' && (
            <div className="py-6 text-center font-['Work_Sans',sans-serif] text-body">
              Dienst wordt geladen...
            </div>
          )}

          {status === 'failed' && (
            <div className="py-6 text-center font-['Work_Sans',sans-serif] text-red-600">
              {error || 'Dienst kon niet worden geladen.'}
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
            {/* ── Left column (spans 2 of 3) ───────────────────────── */}
            <div className='lg:col-span-2 flex flex-col gap-4'>
              {/* Serviceoverzicht */}
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h2 className="font-['Work_Sans',sans-serif] font-bold text-xl md:text-2xl text-heading leading-tight">
                  {t('serviceDetail.overviewTitle')}
                </h2>
               
              </div>
              {service?.description ? (
                <p className="font-['Work_Sans',sans-serif] font-normal text-body text-base leading-relaxed">
                  {service.description}
                </p>
              ) : null}
              {priceText ? (
                <span className="font-['Work_Sans',sans-serif] font-bold text-primary text-lg">
                  {t('serviceDetail.basePriceLabel')}: {priceText}
                </span>
              ) : null}
              {/* Projectgalerij */}
              {hasGallery ? (
                <div className='flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-6'>
                  <h2 className="font-['Work_Sans',sans-serif] font-bold text-xl md:text-2xl text-heading leading-tight">
                    {t('serviceDetail.galleryTitle')}
                  </h2>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    {galleryBefore ? (
                      <div className='bg-[#f1f5f9] rounded-xl relative overflow-hidden'>
                        <div className='h-52 sm:h-64 relative'>
                          <img
                            src={galleryBefore}
                            alt=''
                            className='absolute inset-0 w-full h-full object-cover'
                          />
                        </div>
                      </div>
                    ) : null}

                    {galleryAfter ? (
                      <div className='bg-[#f1f5f9] border-2 border-[rgba(244,133,37,0.2)] rounded-xl relative overflow-hidden p-0.5'>
                        <div className='h-52 sm:h-64 relative'>
                          <img
                            src={galleryAfter}
                            alt=''
                            className='absolute inset-0 w-full h-full object-cover'
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Why Choose Us */}
              <div className='bg-[rgba(244,133,37,0.1)] rounded-xl p-6 flex flex-col gap-2 mt-6 sm:mt-8'>
                <h3 className="font-['Work_Sans',sans-serif] font-bold text-lg text-primary leading-7">
                  {t('serviceDetail.whyTitle')}
                </h3>

                <div className='flex flex-col gap-3 mt-1'>
                  {WHY_KEYS.map((key) => (
                    <div key={key} className='flex gap-2 items-center'>
                      <img
                        src={IMG_DETAIL_CHECK}
                        alt=''
                        className='size-3.5 shrink-0 block'
                      />
                      <span className="font-['Work_Sans',sans-serif] font-normal text-heading text-sm leading-5">
                        {t(`serviceDetail.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hoe wij werken */}
              <div className='flex flex-col gap-6 sm:gap-8 pt-10 sm:pt-12'>
                <h2 className="font-['Work_Sans',sans-serif] font-bold text-xl md:text-2xl text-heading leading-tight">
                  {t('serviceDetail.workTitle')}
                </h2>

                {/* Steps with vertical connector line */}
                <div className='relative flex flex-col gap-6 sm:gap-8'>
                  {/* Vertical divider image */}
                  <div className='absolute left-5 top-0 bottom-0 w-0.5 pointer-events-none'>
                    <img
                      src={IMG_DETAIL_STEPS_DIVIDER}
                      alt=''
                      className='absolute inset-0 w-full h-full object-cover'
                    />
                  </div>

                  {STEPS.map(({ num, titleKey, descKey }) => (
                    <div
                      key={num}
                      className='flex gap-4 sm:gap-6 items-start relative'
                    >
                      {/* Numbered circle */}
                      <div className='bg-primary rounded-full size-11 flex items-center justify-center shrink-0 relative'>
                        <div className='absolute inset-0 rounded-full shadow-[0px_0px_0px_8px_#f8f7f5]' />
                        <span className="font-['Work_Sans',sans-serif] font-bold text-base text-white leading-6 relative">
                          {num}
                        </span>
                      </div>

                      {/* Step content */}
                      <div className='flex flex-col gap-1'>
                        <h3 className="font-['Work_Sans',sans-serif] font-bold text-base sm:text-lg text-heading leading-7">
                          {t(`serviceDetail.${titleKey}`)}
                        </h3>
                        <p className="font-['Work_Sans',sans-serif] font-normal text-body text-base leading-6">
                          {t(`serviceDetail.${descKey}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right sidebar (empty for now) ────────────────────── */}
            <div className='flex flex-col gap-6 sm:gap-8' />
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
});

ServiceDetailContent.displayName = 'ServiceDetailContent';

export default ServiceDetailContent;
