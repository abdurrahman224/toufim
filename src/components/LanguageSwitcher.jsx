import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_CONFIG } from '../config';

const LanguageSwitcher = memo(() => {
  const { i18n, t } = useTranslation();
  const currentLocale = i18n.language;

  const handleSwitch = useCallback(
    (locale) => {
      if (locale === currentLocale) return;
      i18n.changeLanguage(locale);
      localStorage.setItem(I18N_CONFIG.STORAGE_KEY, locale);
    },
    [currentLocale, i18n],
  );

  return (
    <div
      className='flex items-center gap-1'
      role='group'
      aria-label={t('language.switchTo')}
    >
      {I18N_CONFIG.SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type='button'
          onClick={() => handleSwitch(locale)}
          aria-pressed={currentLocale === locale}
          className={
            currentLocale === locale
              ? 'px-2 py-1 rounded text-xs font-bold bg-white text-[#F48525]'
              : 'px-2 py-1 rounded text-xs font-semibold text-white/80 hover:text-white hover:bg-[#e07520] transition-colors duration-150'
          }
        >
          {t(`language.${locale}`)}
        </button>
      ))}
    </div>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
