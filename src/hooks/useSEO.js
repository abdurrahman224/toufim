import { useEffect } from 'react';
import { generateMetadata, updateMetaTags } from '../utils/seo';

export const useSEO = ({
  title,
  description,
  keywords = [],
  image = '',
  type = 'website',
  locale = 'en',
}) => {
  // Serialize array to a stable primitive so the effect only re-runs
  // when the keyword values actually change, not on every render.
  const keywordsKey = keywords.join(',');

  useEffect(() => {
    const metadata = generateMetadata({
      title,
      description,
      keywords,
      image,
      type,
      locale,
    });

    updateMetaTags(metadata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, keywordsKey, image, type, locale]);
};
