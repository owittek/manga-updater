import { Embed } from "../src/interfaces/Embed.ts";

// rename this file to config.ts before usage!
export const config = {
    webhook: {
        id: '',
        token: ''
    },

    body: {
        username: '',
        avatar_url: '',
        embeds: [] as Embed[] // embeds should not be changed
    }
}