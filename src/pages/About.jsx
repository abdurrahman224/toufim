import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import AboutContent from '../components/about/AboutContent';

const About = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('about.seoTitle'),
    description: t('about.seoDescription'),
    keywords: ['about', 'over ons', 'bouw', 'EliteBuild'],
  });

  return <AboutContent />;
});

About.displayName = 'About';

export default About;
