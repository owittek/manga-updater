import { DOMParser, HTMLDocument } from "../deps/deno-dom.ts";
import { Webpage } from "../enums/Webpage.ts";
import { Embed } from "../interfaces/Embed.ts";
import { Manga } from "../interfaces/Manga.ts";

export async function getDOM(url: string): Promise<HTMLDocument> {
  const html = await fetch(url);
  return <HTMLDocument> new DOMParser().parseFromString(
    await (html.text()),
    "text/html",
  );
}

export function getChapterName(dom: HTMLDocument, url: string) {
  return getChapterElement(dom, url).innerText.trim();
}

export function getMangaEmbed(document: HTMLDocument, manga: Manga): Embed {
  const embed: Embed = {
    title: "",
    url: manga.url,
  };

  const chapterElement = getChapterElement(document, manga.url);
  const baseUrl = new URL(manga.url).origin;

  switch (baseUrl) {
    case Webpage.mangakakalot:
      embed.url = chapterElement.getElementsByTagName("a")[0].getAttribute(
        "href",
      )!;
      embed.image = {
        url: document.getElementsByClassName("manga-info-pic")[0]
          .getElementsByTagName("img")[0].getAttribute("src")!,
      };
      break;

    case Webpage.manganato:
    case Webpage.readmanganato:
    case Webpage.manganelo: {
      embed.url = chapterElement.getAttribute("href")!;
      embed.image = {
        url: document.getElementsByClassName("info-image")[0]
          .getElementsByTagName("img")[0].getAttribute("src")!,
      };
      break;
    }

    case Webpage.mangadex: {
      const chapterPath = chapterElement.getElementsByTagName("a")[0]
        .getAttribute("href")!;
      embed.url = new URL(baseUrl, chapterPath).toString();
      embed.image = {
        url: new URL(
          baseUrl,
          document.getElementsByClassName("rounded")[0].getAttribute("href")!,
        ).toString(),
      };
      break;
    }

    case Webpage.asurascans: {
      embed.url = document.getElementsByClassName("epcurlast")![0]
        .parentElement!.getAttribute("href")!;
      embed.image = {
        url: document.getElementsByClassName("attachment-")[0].getAttribute(
          "src",
        )!,
      };
      break;
    }

    default:
      throw new Error(`Case for ${baseUrl} has not been implemented yet!`);
  }

  embed.title =
    `${chapterElement.innerText.trim()} of '${manga.name}' just dropped!`;
  return embed;
}

function getChapterElement(document: HTMLDocument, url: string | URL) {
  let chapterElement;
  const baseUrl = typeof url === "string" ? new URL(url).origin : url.origin;

  switch (baseUrl) {
    case Webpage.mangakakalot:
      chapterElement =
        document.getElementsByClassName("row")[1].getElementsByTagName(
          "span",
        )[0];
      break;

    case Webpage.manganato:
    case Webpage.readmanganato:
    case Webpage.manganelo: {
      chapterElement = document.getElementsByClassName("chapter-name")[0];
      break;
    }

    case Webpage.mangadex: {
      chapterElement = document.getElementsByClassName("text-truncate")[0];
      break;
    }

    case Webpage.asurascans: {
      chapterElement = document.getElementsByClassName("epcurlast")[0];
      break;
    }

    default:
      throw new Error(`Case for ${baseUrl} has not been implemented yet!`);
  }
  return chapterElement;
}
