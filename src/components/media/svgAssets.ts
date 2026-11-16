import jasmine from '/images/svg/ornaments/ornament-jasmine-tunisia.svg?raw';
import razji from '/images/svg/ornaments/ornament-razji-bahrain.svg?raw';
import tunisia from '/images/svg/flags/flag-tunisia.svg?raw';
import bahrain from '/images/svg/flags/flag-bahrain.svg?raw';
import skyline from '/images/svg/skyline/skyline-tunisia-bahrain.svg?raw';
import mapTunisia from '/images/svg/maps/map-tunisia.svg?raw';
import mapBahrain from '/images/svg/maps/map-bahrain.svg?raw';
import mapRegion from '/images/svg/maps/map-region-tunisia-bahrain.svg?raw';

/** A closed registry: external/user strings can never become SVG markup. */
export const svgAssets = { jasmine, razji, tunisia, bahrain, skyline, mapTunisia, mapBahrain, mapRegion };
export type SvgAsset = keyof typeof svgAssets;
