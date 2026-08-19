import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../hooks/useSEO';
import ContactContent from '../components/contact/ContactContent';

const Contact = memo(() => {
  const { t } = useTranslation();

  useSEO({
    title: t('contact.title'),
    description: t('contact.subtitle'),
    keywords: ['contact', 'email', 'message'],
  });

  return <ContactContent />;
});

Contact.displayName = 'Contact';

export default Contact;
