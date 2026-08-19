import React, { memo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { API_ENDPOINTS } from '../../services/httpEndpoint';

// Giveaway countdown target — will be updated from API
let TARGET_DATE = null;

const pad = (n) => String(n).padStart(2, '0');

const getTimeLeft = (target) => {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
};

const TimeUnit = memo(({ value, label }) => (
  <div className='flex flex-col items-center'>
    <span className="font-['Work_Sans',sans-serif] font-semibold text-white text-2xl leading-none tabular-nums">
      {pad(value)}
    </span>
    <span className="font-['Work_Sans',sans-serif] font-medium text-[#ffc898] text-[9px] uppercase tracking-[0.8px] mt-0.5">
      {label}
    </span>
  </div>
));

TimeUnit.displayName = 'TimeUnit';

const Colon = () => (
  <span className="font-['Work_Sans',sans-serif] font-semibold text-white text-2xl leading-none pb-3.5 select-none">
    :
  </span>
);

const AnnouncementBar = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Fetch active giveaway data from API and start countdown
  useEffect(() => {
    let id = null;

    const fetchGiveaway = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.GIVEAWAY.ACTIVE);
        console.log('API Response:', response);

        const giveaway = response?.data || response;

        if (giveaway && giveaway.drawDate) {
          const newTargetDate = new Date(giveaway.drawDate);
          TARGET_DATE = newTargetDate;
          console.log('✓ TARGET_DATE updated from API:', TARGET_DATE);
          
          // Set initial time
          setTime(getTimeLeft(newTargetDate));
          
          // Start countdown interval
          id = setInterval(() => {
            setTime(getTimeLeft(newTargetDate));
          }, 1000);
        } else {
          console.warn('✗ No drawDate in API response');
          setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('✗ Failed to fetch active giveaway:', error);
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    fetchGiveaway();

    return () => {
      if (id) clearInterval(id);
    };
  }, []);

  const handleBuyNow = useCallback(() => {
    navigate('/giveaway');
  }, [navigate]);

  return (
    <div className='bg-primary w-full py-3 px-6 xl:px-20'>
      {/* ── MOBILE only (< sm) ── */}
      <div className='sm:hidden flex items-center justify-between gap-3'>
        {/* Timer */}
        <div className='flex items-end gap-1.5'>
          {[
            { v: time.days, l: t('home.announcement.days') },
            { v: time.hours, l: t('home.announcement.hours') },
            { v: time.minutes, l: t('home.announcement.minutes') },
            { v: time.seconds, l: t('home.announcement.seconds') },
          ].map(({ v, l }, i) => (
            <React.Fragment key={l}>
              {i > 0 && (
                <span className="font-['Work_Sans',sans-serif] font-semibold text-white text-lg leading-none pb-3 select-none">
                  :
                </span>
              )}
              <div className='flex flex-col items-center'>
                <span className="font-['Work_Sans',sans-serif] font-semibold text-white text-lg leading-none tabular-nums">
                  {pad(v)}
                </span>
                <span className="font-['Work_Sans',sans-serif] font-medium text-[#ffc898] text-[8px] uppercase tracking-[0.6px] mt-0.5">
                  {l}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
        {/* Button */}
        <button
          type='button'
          onClick={handleBuyNow}
          className="shrink-0 border border-white rounded-lg px-3 py-2 font-['Work_Sans',sans-serif] font-bold text-white text-xs hover:bg-white hover:text-primary transition-colors duration-200"
        >
          {t('home.announcement.buyNow')}
        </button>
      </div>

      {/* ── TABLET + DESKTOP (sm+) — unchanged ── */}
      <div className='hidden sm:grid grid-cols-3 items-center gap-4 container mx-auto'>
        {/* Left label */}
        <p className="font-['Work_Sans',sans-serif] font-medium text-white text-sm sm:text-base lg:text-lg xl:text-2xl tracking-[-0.9px] whitespace-pre-line">
          {t('home.announcement.title')}
        </p>

        {/* Countdown */}
        <div className='flex items-end gap-2 xl:gap-4 xl:ml-20'>
          <TimeUnit value={time.days} label={t('home.announcement.days')} />
          <Colon />
          <TimeUnit value={time.hours} label={t('home.announcement.hours')} />
          <Colon />
          <TimeUnit
            value={time.minutes}
            label={t('home.announcement.minutes')}
          />
          <Colon />
          <TimeUnit
            value={time.seconds}
            label={t('home.announcement.seconds')}
          />
        </div>

        {/* Buy Now CTA */}
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={handleBuyNow}
            className="border border-white rounded-lg px-6 py-2.5 font-['Work_Sans',sans-serif] font-bold text-white text-sm hover:bg-white hover:text-primary transition-colors duration-200"
          >
            {t('home.announcement.buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
});

AnnouncementBar.displayName = 'AnnouncementBar';

export default AnnouncementBar;
