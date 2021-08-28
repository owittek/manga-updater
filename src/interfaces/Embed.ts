import { EmbedImage } from "./EmbedImage.ts";

export interface Embed {
  title: string;
  url: string;
  color?: number;
  description?: string;
  image?: EmbedImage;
}
