import type { LoaderFunctionArgs } from 'react-router';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { loadMatrixCatalog } from './catalog';
import { loadMatrixView } from './content';

const catalogIds = import.meta.glob('/src/content/generated/matrix/*.json');
export async function loader({ params }: LoaderFunctionArgs) {
  const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
  const id = params.slideId ?? 'intro';
  await Promise.all([
    loadMatrixView(locale, id),
    loadMatrixCatalog([`/src/content/generated/matrix/${id}.json` in catalogIds ? id : 'intro']),
    ...(!params.slideId ? [import('./MatrixIntro')] : []),
  ]);
  return null;
}
