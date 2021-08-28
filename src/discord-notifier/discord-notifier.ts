import { Body } from "../interfaces/Body.ts";
import { Embed } from "../interfaces/Embed.ts";
import { config } from "../../config/config.ts";

const webhookUrl = `https://discord.com/api/webhooks/${config.webhook.id}/${config.webhook.token}`;

export async function sendDiscordMessage(...embeds: Embed[]) {
    return await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getBody(embeds))
    });
}

function getBody(embeds: Embed[]): Body {
    const embedColorOrRandom = config.discordSettings.embedColor;
    if (embedColorOrRandom !== undefined) {
        const color = (embedColorOrRandom.localeCompare('random', undefined, { sensitivity: 'accent' }) == 0) ?
            Math.floor(Math.random() * (0xffffff + 1)) : Number.parseInt(config.discordSettings.embedColor);
        embeds.forEach(embed => embed.color = color);
    }

    return {
        username: config.discordSettings.username,
        avatar_url: config.discordSettings.avatarUrl,
        embeds: embeds
    }
}