import { createElement, useId, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { svgAssets, type SvgAsset } from './svgAssets';

const tags = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'defs',
  'mask',
  'clipPath',
  'use',
  'linearGradient',
  'radialGradient',
  'stop',
]);
const attributes = new Set([
  'id',
  'd',
  'viewBox',
  'preserveAspectRatio',
  'xmlns',
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'points',
  'transform',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'fill-rule',
  'clip-rule',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'class',
  'mask',
  'maskUnits',
  'clip-path',
  'clipPathUnits',
  'href',
  'offset',
  'stop-color',
  'stop-opacity',
]);
const parsed = new Map<SvgAsset, Element>();
function renderNode(element: Element, prefix: string, root = false, title?: string, key = 0): ReactNode {
  if (!tags.has(element.tagName)) return null;
  const props: Record<string, string | number> = { key };
  for (const attribute of element.attributes) {
    const { name } = attribute;
    if (!attributes.has(name) && !name.startsWith('data-')) continue;
    let value = attribute.value;
    if (name === 'href' && !value.startsWith('#')) continue;
    if (name === 'id') {
      props['data-svg-id'] = value;
      value = `${prefix}-${value}`;
    }
    value = value.replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
    if (name === 'href') value = `#${prefix}-${value.slice(1)}`;
    const reactName = name.startsWith('data-')
      ? name
      : name === 'class'
        ? 'className'
        : name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    props[reactName] = value;
  }
  if (root) {
    props.focusable = 'false';
    if (title) {
      props.role = 'img';
      props['aria-labelledby'] = `${prefix}-title`;
    } else props['aria-hidden'] = 'true';
  }
  return createElement(
    element.tagName,
    props,
    root && title ? createElement('title', { id: `${prefix}-title` }, title) : null,
    Array.from(element.children).map((child, index) => renderNode(child, prefix, false, undefined, index)),
  );
}

export function InlineSvg({
  asset,
  title,
  className,
}: {
  asset: SvgAsset;
  title?: string;
  className?: string;
}) {
  const prefix = useId().replace(/:/g, '');
  const artwork = useMemo(() => {
    let element = parsed.get(asset);
    if (!element) {
      element = new DOMParser().parseFromString(svgAssets[asset], 'image/svg+xml').documentElement;
      parsed.set(asset, element);
    }
    return renderNode(element, prefix, true, title);
  }, [asset, prefix, title]);
  return <span className={cn('ui-inline-svg', className)}>{artwork}</span>;
}
