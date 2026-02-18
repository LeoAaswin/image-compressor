export interface FaviconSize {
  size: number;
  name: string;
  filename: string;
}

export interface GeneratedFavicon {
  size: FaviconSize;
  blob: Blob;
  url: string;
}

export interface IcoFavicon {
  size: number;
  name: string;
  filename: string;
  blob: Blob;
  url: string;
}

export type MultipleIcoFavicons = IcoFavicon[];

export type GenerationMode = 'image' | 'text';

export interface TextFaviconSettings {
  faviconText: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
}