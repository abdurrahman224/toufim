import React, { memo, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Shapes, ChevronDown, CloudUpload, MousePointer2, MapPinCheckInside, LockKeyhole, Gauge, BadgeCheck, Wallet, Headset } from 'lucide-react';
import AnnouncementBar from '../home/AnnouncementBar';
import HomeNav from '../home/HomeNav';
import FooterSection from '../home/FooterSection';
import { httpMethods } from '../../services/httpMethods';
import {
  IMG_CONTACT_SERVICE_ICON,
  IMG_CONTACT_LOCATION_ICON,
  IMG_CONTACT_UPLOAD_ICON,
  IMG_CONTACT_SEND_ICON,
  IMG_CONTACT_LOCK_ICON,
  IMG_CONTACT_WHATSAPP_ICON,
  IMG_CONTACT_QUOTE_BTN_ICON,
  IMG_CONTACT_FAST_ICON,
  IMG_CONTACT_EXPERT_ICON,
  IMG_CONTACT_PRICING_ICON,
  IMG_CONTACT_DROPDOWN_ICON,
} from '../home/assets';

const InputField = memo(
  ({ label, id, type, placeholder, Icon, value, onChange }) => (
    <div className='flex flex-col gap-2'>
      <label
        htmlFor={id}
        className='font-semibold text-sm text-form-label leading-5'
      >
        {label}
      </label>
      <div className='relative'>
        <div className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none'>
          <Icon size={18} className='text-muted' strokeWidth={1.9} />
        </div>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className='w-full bg-surface border border-[rgba(244,133,37,0.2)] rounded-lg py-3.75 pl-10.25 pr-4.25 text-base text-heading placeholder-placeholder outline-none focus:border-primary transition-colors'
        />
      </div>
    </div>
  ),
);
InputField.displayName = 'InputField';

const INFO_CARDS = [
  { Icon: Gauge, titleKey: 'fastTitle', descKey: 'fastDesc' },
  { Icon: Headset, titleKey: 'expertTitle', descKey: 'expertDesc' },
  { Icon: BadgeCheck, titleKey: 'pricingTitle', descKey: 'pricingDesc' },
];

const ContactContent = memo(() => {
  const { t } = useTranslation();
  const serviceOptions = t('contact.serviceOptions', { returnObjects: true });

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: '',
    address: '',
    projectDetails: '',
    referenceImages: [],
  });
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = useCallback(
    (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [],
  );

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.size <= 5 * 1024 * 1024 &&
        ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type),
    );
    if (validFiles.length > 5) {
      setError(t('contact.fileErrorMax'));
      return;
    }

    const previews = validFiles.map((file) => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    }));

    setImagePreviews((prev) => {
      prev.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });

      return previews;
    });

    setForm((prev) => ({
      ...prev,
      referenceImages: validFiles,
    }));
    setError('');
  }, [t]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(
      (file) =>
        file.size <= 5 * 1024 * 1024 &&
        ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type),
    );
    if (validFiles.length > 5) {
      setError(t('contact.fileErrorMax'));
      return;
    }

    const previews = validFiles.map((file) => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    }));

    setImagePreviews((prev) => {
      prev.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });

      return previews;
    });

    setForm((prev) => ({
      ...prev,
      referenceImages: validFiles,
    }));
    setError('');
  }, [t]);

  useEffect(
    () => () => {
      imagePreviews.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    },
    [imagePreviews],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setSuccess(false);

      // Validation
      if (
        !form.fullName ||
        !form.email ||
        !form.phone ||
        !form.serviceType ||
        !form.address
      ) {
        setError(t('contact.errorRequired'));
        return;
      }

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('fullName', form.fullName);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        formData.append('serviceType', form.serviceType);
        formData.append('address', form.address);
        formData.append('projectDetails', form.projectDetails || '');

        // Append files if present
        if (form.referenceImages.length > 0) {
          form.referenceImages.forEach((file) => {
            formData.append('referenceImages', file);
          });
        }

        await httpMethods.post('/leads', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setSuccess(true);
        setForm({
          fullName: '',
          email: '',
          phone: '',
          serviceType: '',
          address: '',
          projectDetails: '',
          referenceImages: [],
        });
        setImagePreviews([]);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } catch (err) {
        setError(err.response?.data?.message || t('contact.errorSubmit'));
      } finally {
        setLoading(false);
      }
    },
    [form, t],
  );

  return (
    <div className='bg-surface min-h-screen'>
      <AnnouncementBar />
      <HomeNav />

      <main className='px-4 sm:px-6 md:px-10 xl:px-20 pt-8 sm:pt-12 pb-12'>
        <div className='container mx-auto flex flex-col gap-10'>
          {/* Page Header */}
          <div className='flex flex-col gap-3'>
            <h1 className='font-bold text-2xl sm:text-3xl md:text-4xl text-heading leading-tight'>
              {t('contact.pageHeading')}
            </h1>
            <p className='font-normal text-base text-body leading-7'>
              {t('contact.pageSubtitle')}
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className='bg-white border border-[rgba(244,133,37,0.05)] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8'
          >
            {/* Section 1 — Personal info 2×2 grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <InputField
                label={t('contact.labelFullName')}
                id='fullName'
                type='text'
                placeholder={t('contact.placeholderFullName')}
                Icon={User}
                value={form.fullName}
                onChange={handleChange('fullName')}
              />
              <InputField
                label={t('contact.labelEmail')}
                id='email'
                type='email'
                placeholder={t('contact.placeholderEmail')}
                Icon={Mail}
                value={form.email}
                onChange={handleChange('email')}
              />
              <InputField
                label={t('contact.labelPhone')}
                id='phone'
                type='tel'
                placeholder={t('contact.placeholderPhone')}
                Icon={Phone}
                value={form.phone}
                onChange={handleChange('phone')}
              />

              {/* Service Type select */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='serviceType'
                  className='font-semibold text-sm text-form-label leading-5'
                >
                  {t('contact.labelServiceType')}
                </label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                    {/* <img
                      src={IMG_CONTACT_SERVICE_ICON}
                      alt=''
                      className='w-4.75 h-5 object-contain'
                    /> */}
                    <samp className='text-[#94A3B8]'><Shapes /></samp>
                  </div>
                  <select
                    id='serviceType'
                    value={form.serviceType}
                    onChange={handleChange('serviceType')}
                    className='w-full appearance-none bg-surface border border-[rgba(244,133,37,0.2)] rounded-lg py-3.75 pl-10.25 pr-10 text-base text-heading outline-none focus:border-primary transition-colors cursor-pointer'
                  >
                    <option value='' disabled>
                      {t('contact.placeholderServiceType')}
                    </option>
                    {Array.isArray(serviceOptions) &&
                      serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                  </select>
                  <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
            <samp className='text-[#6B7280]'><ChevronDown /></samp>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Project Address */}
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='address'
                className='font-semibold text-sm text-form-label leading-5'
              >
                {/* {t('contact.labelAddress')} */}
              </label>
              <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                  {/* <img
                    src={IMG_CONTACT_LOCATION_ICON}
                    alt=''
                    className='w-4 h-5 object-contain'
                  /> */}
                  <samp className='text-[#94A3B8]'><MapPinCheckInside /></samp>
                </div>
                <input
                  id='address'
                  type='text'
                  placeholder={t('contact.placeholderAddress')}
                  value={form.address}
                  onChange={handleChange('address')}
                  className='w-full bg-surface border border-[rgba(244,133,37,0.2)] rounded-lg py-3.75 pl-10.25 pr-4.25 text-base text-heading placeholder-placeholder outline-none focus:border-primary transition-colors'
                />
              </div>
            </div>

            {/* Section 3 — Project Details */}
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='projectDetails'
                className='font-semibold text-sm text-form-label leading-5'
              >
                {t('contact.labelDetails')}
              </label>
              <textarea
                id='projectDetails'
                placeholder={t('contact.placeholderDetails')}
                value={form.projectDetails}
                onChange={handleChange('projectDetails')}
                rows={5}
                className='w-full bg-surface border border-[rgba(244,133,37,0.2)] rounded-lg pt-3.25 px-4.25 pb-21.25 text-base text-heading placeholder-placeholder outline-none focus:border-primary transition-colors resize-none leading-6'
              />
            </div>

            {/* Section 4 — File Upload */}
            <div className='flex flex-col gap-2'>
              <span className='font-semibold text-sm text-form-label leading-5'>
                {t('contact.labelUpload')}
              </span>
              <label
                className={`flex flex-col items-center justify-center h-35 bg-[rgba(244,133,37,0.05)] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  dragOver ? 'border-primary' : 'border-[rgba(244,133,37,0.2)]'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type='file'
                  accept='.png,.jpg,.jpeg,.pdf'
                  multiple
                  onChange={handleFileChange}
                  className='hidden'
                />
                <samp className='text-[#F48525]'><CloudUpload /></samp>
                <div className='flex items-center gap-1'>
                  <span className='font-semibold text-sm text-primary'>
                    {t('contact.uploadCta')}
                  </span>
                  <span className='font-normal text-sm text-body'>
                    {t('contact.uploadOr')}
                  </span>
                </div>
                <p className='font-normal text-xs text-muted mt-1'>
                  {t('contact.uploadHint')}
                </p>
              </label>
              {form.referenceImages.length > 0 && (
                <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  {imagePreviews.map(({ file, url }, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className='overflow-hidden rounded-lg border border-[rgba(244,133,37,0.15)] bg-white'
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={file.name}
                          className='h-40 w-full object-contain bg-white p-2'
                        />
                      ) : (
                        <div className='flex h-28 items-center justify-center bg-[rgba(244,133,37,0.08)] px-3 text-center text-xs text-heading'>
                          {file.name}
                        </div>
                      )}
                      <div className='px-3 py-2 text-[11px] text-body truncate'>
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5 — Submit */}
            <div className='flex flex-col gap-4 pt-4'>
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700'>
                  {error}
                </div>
              )}
              {success && (
                <div className='bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700'>
                  {t('contact.successMessage')}
                </div>
              )}
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-primary hover:bg-primary-700 disabled:opacity-50 transition-colors rounded-lg py-4 flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(244,133,37,0.2),0_4px_6px_-4px_rgba(244,133,37,0.2)]'
              >
                <span className='font-bold text-lg text-white leading-7'>
                  {loading ? t('contact.submitButtonLoading') : t('contact.submitButton')}
                </span>
                <span className='text-white rotate-90'><MousePointer2 /></span>
              </button>
              <div className='flex items-center justify-center gap-1.5'>
                <samp className='text-[#64748B]'><LockKeyhole size={12} /></samp>
                <p className='font-normal text-sm text-muted text-center leading-5'>
                  {t('contact.securityNote')}
                </p>
              </div>
            </div>
          </form>

          {/* 3-col info strip */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-[rgba(244,133,37,0.1)] pt-10 sm:pt-14 pb-8 sm:pb-12'>
            {INFO_CARDS.map(({ Icon, titleKey, descKey }) => (
              <div key={titleKey} className='flex flex-col'>
                <div className='w-12.5 h-12.5 bg-[rgba(244,133,37,0.1)] rounded-full flex items-center justify-center mb-4'>
                  <Icon size={24} className='text-primary' strokeWidth={1.9} />
                </div>
                <h3 className='font-bold text-base text-heading leading-6 mb-2'>
                  {t(`contact.${titleKey}`)}
                </h3>
                <p className='font-normal text-sm text-body leading-5'>
                  {t(`contact.${descKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* WhatsApp FAB */}
      <a
        href='https://wa.me/'
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Chat on WhatsApp'
        className='fixed bottom-6 right-6 z-50 w-14 h-14 drop-shadow-lg hover:scale-110 transition-transform'
      >
        <svg
          viewBox='0 0 48 48'
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          className='w-full h-full'
        >
          <title>Whatsapp-color</title>
          <desc>Created with Sketch.</desc>
          <g fill='none' fillRule='evenodd'>
            <g transform='translate(-700.000000, -360.000000)' fill='#67C15E'>
              <path d='M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z' />
            </g>
          </g>
        </svg>
      </a>

      <FooterSection />
    </div>
  );
});

ContactContent.displayName = 'ContactContent';

export default ContactContent;
