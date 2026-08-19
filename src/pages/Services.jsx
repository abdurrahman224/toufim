import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import ServicesContent from '../components/services/ServicesContent';

const Services = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('services.seoTitle'),
    description: t('services.seoDescription'),
    keywords: ['diensten', 'renovatie', 'bouw', 'loodgieter', 'elektra'],
  });

  return <ServicesContent />;
});

Services.displayName = 'Services';

export default Services;
