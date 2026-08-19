import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import HomeContent from '../components/home/HomeContent';

const Home = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('home.title'),
    description: t('home.subtitle'),
    keywords: ['react', 'webpack', 'tailwind', 'router'],
  });

  return <HomeContent />;
});

Home.displayName = 'Home';

export default Home;
