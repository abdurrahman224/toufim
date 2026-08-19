import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import GiveawayContent from '../components/services/GiveawayContent';

const Giveaway = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('giveaway.seoTitle'),
    description: t('giveaway.seoDescription'),
    keywords: ['giveaway', 'badkamer renovatie', 'winnen', 'tickets'],
  });

  return <GiveawayContent />;
});

Giveaway.displayName = 'Giveaway';

export default Giveaway;
