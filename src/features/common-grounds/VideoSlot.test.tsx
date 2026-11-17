import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ContentProvider } from '@/i18n/ContentProvider';
import matrix from '@/content/locales/en/matrix.json';
import { VideoSlot } from './VideoSlot';
vi.mock('@/components/media/ResponsiveImage', () => ({
  ResponsiveImage: () => <span data-testid="poster" />,
}));
vi.mock('@/components/media/ImageCatalog', () => ({ useImage: () => undefined }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it('does not contact YouTube before activation and removes the player when inactive', () => {
  const view = (active: boolean) => (
    <ContentProvider locale="en" content={{ matrix }}>
      <VideoSlot
        active={active}
        video={{ provider: 'youtube', id: 'example' }}
        fallback="tn-hist-punic-ports"
        title="Sea"
      />
    </ContentProvider>
  );
  const { container, rerender } = render(view(true));
  expect(container.querySelector('iframe')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: matrix.ui.playVideo }));
  expect(container.querySelector('iframe')?.src).toContain('https://www.youtube-nocookie.com/embed/example');
  rerender(view(false));
  expect(container.querySelector('iframe')).toBeNull();
});
it('plays files muted, exposes captions and mute control, and pauses inactive playback', () => {
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const view = (active: boolean) => (
    <ContentProvider locale="en" content={{ matrix }}>
      <VideoSlot
        active={active}
        video={{
          provider: 'file',
          src: '/example.mp4',
          poster: 'tn-hist-punic-ports',
          captions: '/example.en.vtt',
        }}
        fallback="tn-hist-punic-ports"
        title="Sea"
      />
    </ContentProvider>
  );
  const { container, rerender } = render(view(true));
  const playButton = screen.queryByRole('button', { name: matrix.ui.playVideo });
  if (playButton) fireEvent.click(playButton);
  expect(play).toHaveBeenCalled();
  expect(container.querySelector('video')?.muted).toBe(true);
  expect(container.querySelector('track')).toHaveAttribute('src', '/example.en.vtt');
  fireEvent.click(screen.getByRole('button', { name: matrix.ui.unmute }));
  expect(container.querySelector('video')?.muted).toBe(false);
  rerender(view(false));
  expect(pause).toHaveBeenCalled();
});
