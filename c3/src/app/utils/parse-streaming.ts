import { Relate } from "@/app/interfaces/relate";
import { Source } from "@/app/interfaces/source";
import { fetchStream } from "@/app/utils/fetch-stream";
import { Message } from "../interfaces/message";

const LLM_SPLIT = "__LLM_RESPONSE__";
const RELATED_SPLIT = "__RELATED_QUESTIONS__";

export const parseStreaming = async (
  controller: AbortController,
  query: string,
  messages: Message[],
  search_uuid: string,
  onSources: (value: Source[]) => void,
  onMarkdown: (value: string) => void,
  onRelates: (value: Relate[]) => void,
  onDone: (answer: string, sources: Source[], relates: Relate[]) => void,
  onError?: (status: number) => void,
) => {

  const decoder = new TextDecoder();
  let uint8Array = new Uint8Array();
  let chunks = "";
  let sourcesEmitted = false;

  let answer: string;
  let sources: Source[];
  let relates: Relate[];

  const response = await fetch(`/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*./*",
    },
    signal: controller.signal,
    body: JSON.stringify({
      query,
      messages,
      search_uuid,
    }),
  });
  if (response.status !== 200) {
    onError?.(response.status);
    return;
  }
  const markdownParse = (text: string) => {
    answer = text
      .replace(/\[\[([cC])itation/g, "[citation")
      .replace(/[cC]itation:(\d+)]]/g, "citation:$1]")
      .replace(/\[\[([cC]itation:\d+)]](?!])/g, `[$1]`)
      .replace(/\[[cC]itation:(\d+)]/g, "[citation]($1)")

    onMarkdown(answer);
  };
  fetchStream(
    response,
    (chunk) => {
      uint8Array = new Uint8Array([...uint8Array, ...chunk]);
      chunks = decoder.decode(uint8Array, { stream: true });
      if (chunks.includes(LLM_SPLIT)) {
        const [sources_text, rest] = chunks.split(LLM_SPLIT);
        if (!sourcesEmitted) {
          try {
            sources = JSON.parse(sources_text);
          } catch (e) {
            sources = [];
          }
          onSources(sources)
        }
        sourcesEmitted = true;
        if (rest.includes(RELATED_SPLIT)) {
          const [md] = rest.split(RELATED_SPLIT);
          markdownParse(md);
        } else {
          markdownParse(rest);
        }
      }
    },
    () => {
      const [_, relates_text] = chunks.split(RELATED_SPLIT);
      try {
        relates = JSON.parse(relates_text);
      } catch (e) {
        relates = [];
      }
      onRelates(relates)
      onDone(answer, sources, relates);
    },
  );
};
