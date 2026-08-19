import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import ServiceDetailContent from '../components/services/ServiceDetailContent';

const ServiceDetail = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('serviceDetail.seoTitle'),
    description: t('serviceDetail.seoDescription'),
    keywords: ['sanitair', 'loodgieter', 'installatie', 'renovatie'],
  });

  return <ServiceDetailContent />;
});

ServiceDetail.displayName = 'ServiceDetail';

export default ServiceDetail;
