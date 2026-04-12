export type StyleMode = "cuemath" | "custom";

export type Format = "post" | "story" | "carousel";

export interface Slide {
  index: number;
  heading: string;
  body: string;
  cta: string | null;
}

export interface Creative {
  format: Format;
  slides: Slide[];
}

export interface GenerateRequest {
  idea: string;
  format: Format;
  styleMode: StyleMode;
  customStyle?: string;
}

export interface AngleRequest {
  heading: string;
  idea: string;
  styleMode: StyleMode;
  customStyle?: string;
}

export interface AngleResponse {
  variants: [string, string, string];
}