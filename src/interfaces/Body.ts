import { Embed } from "./Embed.ts";

export interface Body {
  username?: string;
  // deno-lint-ignore camelcase
  avatar_url?: string;
  embeds?: Embed[];
}
