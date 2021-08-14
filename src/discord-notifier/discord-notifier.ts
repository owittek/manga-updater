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

function getBody(embeds: Embed[]) {
    config.body.embeds = embeds;
    return config.body;
}