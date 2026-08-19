import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import CheckoutContent from '../components/services/CheckoutContent';

const Checkout = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('checkout.seoTitle'),
    description: t('checkout.seoDescription'),
    keywords: ['giveaway', 'ticket kopen', 'badkamer renovatie', 'winnen'],
  });

  return <CheckoutContent />;
});

Checkout.displayName = 'Checkout';

export default Checkout;
