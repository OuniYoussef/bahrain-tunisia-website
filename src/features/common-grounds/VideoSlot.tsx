import { useEffect, useRef, useState } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { useImage } from '@/components/media/ImageCatalog';
import { assetUrl, imageSrc, type ImageId } from '@/lib/images';
import type { Video } from './model';

export function VideoSlot({
  video,
  fallback,
  active,
  title,
}: {
  video: Video;
  fallback: ImageId;
  active: boolean;
  title: string;
}) {
  const { ui } = useContent('matrix');
  const locale = useLocale();
  const file = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [reduce, setReduce] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const posterId = video.provider === 'file' ? video.poster : fallback;
  const poster = useImage(posterId);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {
      setReduce(query.matches);
      setLoaded(false);
    };
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const element = file.current;
    const sync = () => {
      if (active && !document.hidden && (!reduce || loaded)) void element?.play().catch(() => {});
      else element?.pause();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      element?.pause();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [active, reduce, loaded]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setLoaded(false);
    };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  return (
    <div className="matrix-video">
      {video.provider === 'file' ? (
        <>
          <video
            ref={file}
            src={assetUrl(video.src)}
            poster={poster ? imageSrc(poster) : undefined}
            muted={muted}
            loop
            playsInline
            controls
            preload="none"
          >
            <track
              kind="captions"
              src={video.captions ? assetUrl(video.captions) : undefined}
              srcLang={locale}
              default
            />
          </video>
          {reduce && !loaded && (
            <button className="matrix-button" onClick={() => setLoaded(true)}>
              {ui.playVideo}
            </button>
          )}
        </>
      ) : active && loaded ? (
        <iframe
          ref={frame}
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&mute=1&loop=1&playlist=${encodeURIComponent(video.id)}&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`}
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setMuted(true)}
        />
      ) : (
        <>
          <ResponsiveImage id={posterId} />
          <button className="matrix-button" onClick={() => setLoaded(true)}>
            {ui.playVideo}
          </button>
        </>
      )}
      {(video.provider === 'file' || loaded) && (
        <button
          className="matrix-video-mute matrix-button"
          onClick={() => {
            setMuted(!muted);
            frame.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: muted ? 'unMute' : 'mute', args: [] }),
              'https://www.youtube-nocookie.com',
            );
          }}
        >
          {muted ? ui.unmute : ui.mute}
        </button>
      )}
    </div>
  );
}
