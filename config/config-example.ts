import { Embed } from "../src/interfaces/Embed.ts";

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