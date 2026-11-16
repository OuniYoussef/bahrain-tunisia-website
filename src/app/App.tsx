import common from '@/content/locales/en/common.json';
import { ContentProvider } from '@/i18n/ContentProvider';
import { useContent } from '@/i18n/content';

function Foundation() {
  const { site } = useContent('common');
  return (
    <main className="ui-container py-20">
      <h1 className="text-display-lg">{site.name}</h1>
    </main>
  );
}

export default function App() {
  return (
    <ContentProvider locale="en" content={{ common }}>
      <Foundation />
    </ContentProvider>
  );
}
