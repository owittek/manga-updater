import { DOMParser, Element, HTMLDocument } from '../deps/deno-dom.ts';
import { Webpage } from "../enums/Webpage.ts";
import { Embed } from "../interfaces/Embed.ts";
import { Manga } from "../interfaces/Manga.ts";
import { getMessage } from "./get-message.ts";
import { getWebpageEnum } from "./get-webpage-enum.ts";

export async function getMangaChapter(manga: Manga) {
    const webPage = getWebpageEnum(manga.baseUrl);

    if (webPage === undefined) {
        throw new Error(`Enum for ${manga.url} has not been implemented yet!`);
    } else {
        const html = await fetch(manga.url);
        const document = <HTMLDocument>new DOMParser().parseFromString(await (html.text()), 'text/html');

        const chapterElement = getChapterElement(document, webPage);
        const chapterName = chapterElement.innerText.trim();
        if (chapterName === undefined) {
            throw new Error(`Parser for ${webPage} might be broken!`);
        }
        return { document, chapterName, chapterElement, webPage };
    }
}

export function getMangaEmbed(document: HTMLDocument, manga: Manga, webPage: Webpage, chapterElement: Element): Embed {
    const embed: Embed = {
        title: '',
        url: manga.url
    }

    switch (webPage) {
        case Webpage.mangakakalot:
            embed.url = chapterElement.getElementsByTagName('a')[0].getAttribute('href')!;
            embed.image = { url: document.getElementsByClassName('manga-info-pic')[0].getElementsByTagName('img')[0].getAttribute('src')! };
            break;

        case Webpage.manganato:
        case Webpage.readmanganato:
        case Webpage.manganelo: {
            embed.url = chapterElement.getAttribute('href')!;
            embed.image = { url: document.getElementsByClassName('info-image')[0].getElementsByTagName('img')[0].getAttribute('src')! };
            break;
        }

        case Webpage.mangadex: {
            const mangadexBaseUrl = new URL(webPage).origin;
            const chapterPath = chapterElement.getElementsByTagName('a')[0].getAttribute('href')!;
            embed.url = new URL(mangadexBaseUrl, chapterPath).toString();
            embed.image = { url: new URL(mangadexBaseUrl, document.getElementsByClassName('rounded')[0].getAttribute('href')!).toString() };
            break;
        }

        default:
            throw new Error(`Case for ${webPage} has not been implemented yet!`);
    }
    embed.title = getMessage(manga, chapterElement.innerText.trim());
    return embed;
}

function getChapterElement(document: HTMLDocument, webPage: Webpage): Element {
    let chapterElement: Element;
    switch (webPage) {
        case Webpage.mangakakalot:
            chapterElement = document.getElementsByClassName('row')[1].getElementsByTagName('span')[0];
            break;

        case Webpage.manganato:
        case Webpage.readmanganato:
        case Webpage.manganelo:
            chapterElement = document.getElementsByClassName('chapter-name')[0];
            break;

        case Webpage.mangadex:
            chapterElement = document.getElementsByClassName('text-truncate')[0];
            break;

        default:
            console.error(`Case for ${webPage} has not been implemented yet!`);
            break;
    }
    return chapterElement!;
}