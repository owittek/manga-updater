import { Webpage } from "../enums/Webpage.ts";

export function getWebpageEnum(baseUrl: string): Webpage | undefined {
  return Object.values(Webpage).find(webPage => webPage.includes(baseUrl));
}
