import React, { memo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AnnouncementBar from '../home/AnnouncementBar';
import HomeNav from '../home/HomeNav';
import FooterSection from '../home/FooterSection';
import { ROUTES } from '../../config';
import { IMG_CHECKOUT_CHECK_GREEN } from '../home/assets';
import { ArrowRight, CircleDot, Ticket, Wallet, X } from 'lucide-react';

import {
  fetchActiveGiveaway,
  selectActiveGiveaway,
  selectActiveGiveawayError,
  selectActiveGiveawayStatus,
} from '../../store/slices/giveawaySlice';
import httpMethods from '../../services/httpMethods';
import API_ENDPOINTS from '../../services/httpEndpoint';

const CheckoutContent = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const giveaway = useSelector(selectActiveGiveaway);
  const giveawayStatus = useSelector(selectActiveGiveawayStatus);
  const giveawayError = useSelector(selectActiveGiveawayError);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedPromoKey, setAppliedPromoKey] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    instagramUsername: '',
  });

  useEffect(() => {
    if (giveawayStatus === 'idle') {
      dispatch(fetchActiveGiveaway());
    }
  }, [dispatch, giveawayStatus]);

  const packages = Array.isArray(giveaway?.packages) ? giveaway.packages : [];

  useEffect(() => {
    if (packages.length && !selectedTicket) {
      // Only set initial selection when packages load and nothing is selected
      const packageType = searchParams.get('package');
      let selectedId = null;

      if (packageType === 'bundle' && packages[1]) {
        selectedId = packages[1].id;
      } else if (packageType === 'single' && packages[0]) {
        selectedId = packages[0].id;
      } else {
        // Default to first package
        selectedId = packages[0].id;
      }

      if (selectedId) {
        setSelectedTicket(selectedId);
      }
    }
  }, [packages]);

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedOption = packages.find((o) => o.id === selectedTicket);
  const basePrice = Number(selectedOption?.price || 0);
  const discount = promoApplied ? promoDiscount : 0;
  const total = (basePrice - discount).toFixed(2);

  const formatPrice = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '';

    return numericValue.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  };

  const handleApplyPromo = async () => {
    const key = promoCode.trim().toUpperCase();
    if (!key || !basePrice) {
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoError(true);
      return;
    }

    const { data, error } = await httpMethods.post(
      '/vouchers/validate',
      {
        code: key,
        orderAmount: basePrice,
      },
    );

    if (error || !data) {
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoError(true);
      return;
    }

    const payload = data?.data ?? data;
    const discountAmount = Number(payload?.discountAmount ?? 0);
    const discountValue = Number(payload?.discountValue ?? 0);
    const discountType = payload?.discountType;
    const computedPercent = Number.isFinite(discountValue)
      ? (basePrice * discountValue) / 100
      : 0;
    const computedDiscount =
      discountType === 'PERCENTAGE' ? computedPercent : discountAmount;
    const normalizedDiscount = Number.isFinite(computedDiscount)
      ? computedDiscount
      : 0;

    if (normalizedDiscount > 0) {
      setPromoApplied(true);
      setAppliedPromoKey(key);
      setPromoDiscount(normalizedDiscount);
      setPromoError(false);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoError(true);
    }
  };

  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.emailAddress || !formData.phoneNumber) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    if (!selectedTicket) {
      setSubmitError('Please select a ticket package');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // STEP 1: Create order
      const { data, error } = await httpMethods.post(API_ENDPOINTS.ORDERS.CREATE, {
        packageId: selectedTicket,
        voucherCode: promoApplied ? appliedPromoKey : null,
        fullName: formData.fullName,
        email: formData.emailAddress,
        phone: formData.phoneNumber,
        instagramUsername: formData.instagramUsername,
        amount: basePrice,
        discount: promoDiscount,
      });

      if (error || !data) {
        throw new Error(error?.response?.data?.error || 'Failed to create order');
      }

      const { orderId, sessionId, paymentUrl } = data.data;

      // Store data for payment success page
      sessionStorage.setItem('orderId', orderId);
      sessionStorage.setItem('sessionId', sessionId);

      // STEP 2: Redirect to Stripe Checkout
      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Order creation error:', err);
      setSubmitError(err.message || 'Failed to create order');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-surface min-h-screen'>
      <AnnouncementBar />
      <HomeNav />

      <main className='px-4 sm:px-6 md:px-10 xl:px-20 py-5'>
        <div className='container mx-auto'>
          {/* ── Card ──────────────────────────────────────────────── */}
          <div className='bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[rgba(244,133,37,0.05)]'>
            {/* Card header */}
            <div className='flex items-center justify-between px-5 sm:px-8 md:px-10 py-4 sm:py-6 border-b border-[rgba(244,133,37,0.1)]'>
              <div className='flex items-center gap-4'>
                <div className='w-7 h-6 shrink-0'>
                  {/* <img
                    src={IMG_CHECKOUT_TICKET_ICON}
                    alt=''
                    className='w-full h-full object-contain'
                  /> */}
                  <samp className='text-[#F48525]'><Ticket /></samp>
                </div>
                <div>
                  <p className='font-bold text-base sm:text-xl text-heading leading-tight'>
                    {t('checkout.cardTitle')}
                  </p>
                  <p className='font-medium text-xs text-muted leading-4'>
                    {t('checkout.cardSubtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(ROUTES.GIVEAWAY)}
                className='w-10 h-10 bg-[#F485251A] rounded-lg flex items-center justify-center hover:bg-[rgba(244,133,37,0.2)] transition-colors'
              >
                <samp className='text-[#F48525]'><X /></samp>
              </button>
            </div>

            {/* Card body */}
            <div className='px-5 sm:px-8 md:px-10 pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 flex flex-col gap-6 sm:gap-8'>
              {/* ── Step 1: Ticket quantity ───────────────────────── */}
              <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-2'>
                  <h1 className='font-bold text-2xl sm:text-3xl text-heading leading-tight'>
                    {t('checkout.step1Heading')}
                  </h1>
                  <p className='font-normal text-base text-muted leading-6'>
                    {t('checkout.step1Desc')}
                  </p>
                </div>

                {giveawayStatus === 'loading' && (
                  <p className='text-sm text-muted'>Loading tickets...</p>
                )}

                {giveawayStatus === 'failed' && (
                  <p className='text-sm text-red-500'>
                    {giveawayError || 'Failed to load tickets.'}
                  </p>
                )}

                {/* Ticket grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {packages.map((option) => {
                    const isSelected = selectedTicket === option.id;
                    const badgeText =
                      option.badgeText ||
                      (option.savePercentage
                        ? `SAVE ${option.savePercentage}%`
                        : null);

                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedTicket(option.id)}
                        className={`flex items-center gap-3 p-4 sm:p-5 rounded-xl border-2 text-left transition-colors ${
                          isSelected
                            ? 'bg-[rgba(244,133,37,0.05)] border-primary'
                            : 'bg-white border-[#f1f5f9] hover:border-[rgba(244,133,37,0.3)]'
                        }`}
                      >
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-0.5'>
                            <span className='font-bold text-lg text-heading leading-7'>
                              {option.title || t('checkout.ticketLabel')}
                            </span>
                            {badgeText && (
                              <span className='bg-primary text-white text-xs font-bold uppercase px-2 py-0.5 rounded-full leading-4'>
                                {badgeText}
                              </span>
                            )}
                          </div>
                          <p className='font-medium text-base text-muted leading-6'>
                            {formatPrice(option.price) || '€ 0'}
                          </p>
                        </div>
                        {/* Radio */}
                        <div
                          className={`w-6 h-6 rounded-full shrink-0 border-2 flex items-center justify-center ${
                            isSelected ? 'text-primary' : 'border-[#cbd5e1]'
                          }`}
                        >
                          {isSelected && (
                            <span><CircleDot /></span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Step 2: Personal details ─────────────────── */}
              <div>
                <h2 className='font-bold text-xl sm:text-2xl text-heading leading-tight mb-4 sm:mb-6'>
                  {t('checkout.step2Heading')}
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {[
                    'fullName',
                    'emailAddress',
                    'phoneNumber',
                    'instagramUsername',
                  ].map((key) => (
                    <div key={key} className='flex flex-col gap-1.5'>
                      <label className='font-semibold text-sm text-heading leading-5'>
                        {t(`checkout.${key}`)}
                      </label>
                      <input
                        type={
                          key === 'emailAddress'
                            ? 'email'
                            : key === 'phoneNumber'
                              ? 'tel'
                              : 'text'
                        }
                        name={key}
                        value={formData[key]}
                        onChange={handleFormChange}
                        placeholder={t(`checkout.${key}`)}
                        className='bg-[#f8fafc] border border-border rounded-lg h-11 px-3 text-base font-normal text-heading placeholder:text-slate-300 placeholder:font-normal outline-none focus:border-primary transition-colors'
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Step 3: Promo code ────────────────────────────── */}
              <div className='border-t border-[#f1f5f9] pt-6 sm:pt-8 flex flex-col gap-4'>
                <h2 className='font-bold text-lg sm:text-xl text-heading leading-7'>
                  {t('checkout.promoTitle')}
                </h2>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    placeholder={t('checkout.promoPlaceholder')}
                    className={`flex-1 border rounded-lg h-12 px-3 text-base font-normal text-heading placeholder:text-slate-300 placeholder:font-normal outline-none transition-colors ${
                      promoError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-border focus:border-primary'
                    }`}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className='bg-heading text-white font-bold text-base px-6 rounded-lg hover:bg-[#1e293b] transition-colors'
                  >
                    {t('checkout.promoApply')}
                  </button>
                </div>
                {promoError && (
                  <p className='text-sm text-red-500 font-medium'>
                    {t('checkout.promoInvalid') || 'Ongeldige promotiecode.'}
                  </p>
                )}
                {promoApplied && (
                  <div className='bg-[#f0fdf4] border border-[#dcfce7] rounded-lg px-4 py-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <img
                        src={IMG_CHECKOUT_CHECK_GREEN}
                        alt=''
                        className='w-4 h-4'
                      />
                      <span className='font-bold text-sm text-[#15803d] uppercase tracking-wide'>
                        {appliedPromoKey} {t('checkout.promoApplied')}
                      </span>
                    </div>
                    <span className='font-bold text-base text-[#15803d]'>
                      -
                      {promoDiscount.toLocaleString('nl-NL', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Step 4: Payment method ────────────────────────── */}
              <div className='flex flex-col gap-4'>
                <h2 className='font-bold text-lg sm:text-xl text-heading leading-7'>
                  {t('checkout.paymentTitle')}
                </h2>
                <div className='flex gap-4'>
                  {[
                    {
                      id: 'stripe',
                      Icon: Wallet,
                      labelKey: 'payStripe',
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex items-center justify-center gap-3 w-full sm:w-auto sm:px-24 md:px-32 py-4 rounded-xl border-2 transition-colors ${
                        selectedPayment === method.id
                          ? 'border-primary bg-[rgba(244,133,37,0.05)]'
                          : 'border-[#f1f5f9] bg-white hover:border-[rgba(244,133,37,0.3)]'
                      }`}
                    >
                      <method.Icon size={20} className='text-[#2563EB]' />
                      <span className='font-bold text-base text-form-label leading-6'>
                        {t(`checkout.${method.labelKey}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Summary & CTA ─────────────────────────────────── */}
              <div className='pt-4'>
                {submitError && (
                  <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-sm text-red-600 font-medium'>{submitError}</p>
                  </div>
                )}
                <div className='border-t border-[#f1f5f9] pt-4 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                  <div>
                    <p className='font-medium text-sm text-muted leading-5'>
                      {t('checkout.totalLabel')}
                    </p>
                    <p className='font-black text-2xl sm:text-3xl text-heading leading-tight'>
                      € {total}
                    </p>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className='bg-primary hover:bg-primary-700 text-white font-black text-base sm:text-lg leading-7 w-full sm:w-auto px-6 sm:px-10 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(244,133,37,0.2),0_4px_6px_-4px_rgba(244,133,37,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? (
                      <>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        Processing...
                      </>
                    ) : (
                      <>
                        {t('checkout.ctaButton')}
                        <ArrowRight />
                      </>
                    )}
                  </button>
                </div>
                <p className='text-xs text-subtle text-center leading-4 px-4 sm:px-10'>
                  {t('checkout.disclaimer')}
                </p>
              </div>
            </div>

            {/* Footer links */}
            {/* <div className='flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-6 sm:py-8 border-t border-[#f1f5f9]'>
              {['footerRules', 'footerPrivacy', 'footerSupport'].map((key) => (
                <a
                  key={key}
                  href='#'
                  className='font-medium text-sm text-subtle hover:text-primary transition-colors leading-5'
                >
                  {t(`checkout.${key}`)}
                </a>
              ))}
            </div> */}
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
});

CheckoutContent.displayName = 'CheckoutContent';

export default CheckoutContent;
