import { SvgArtwork } from './SvgArtwork';
import { svgAssets, type SvgAsset } from './svgAssets';
export function InlineSvg({ asset, ...props }: { asset: SvgAsset; title?: string; className?: string }) {
  return <SvgArtwork source={svgAssets[asset]} {...props} />;
}
