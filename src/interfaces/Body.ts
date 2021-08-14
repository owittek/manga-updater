import { Embed } from "../enums/Embed.ts";

interface Body {
  username?: string;
  // deno-lint-ignore camelcase
  avatar_url?: string;
  embeds?: Embed[];
}
