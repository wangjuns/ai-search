"use client";
import { Answer } from "@/app/components/answer";
import { Relates } from "@/app/components/relates";
import { Sources } from "@/app/components/sources";
import { Relate } from "@/app/interfaces/relate";
import { Source } from "@/app/interfaces/source";
import { parseStreaming } from "@/app/utils/parse-streaming";
import { Annoyed } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import SearchResult from "../interfaces/ai-search-result";
import { Message } from "../interfaces/message";
import { Query } from "./query";

export const Result: FC<{
  query: string;
  rid: string;
  messages: Message[],
  append: (newResult: SearchResult) => void;
}> = ({ query, rid, messages, append }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [markdown, setMarkdown] = useState<string>("");
  const [relates, setRelates] = useState<Relate[] | null>(null);
  const [error, setError] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void parseStreaming(
      controller,
      query,
      messages,
      rid,
      setSources,
      setMarkdown,
      setRelates,
      (_answer, _sources, _relates) => {
        append({
          query: query,
          answer: _answer,
          sources: _sources,
          relates: _relates,
        })
      },
      setError,
    );
    return () => {
      controller.abort();
    };
  }, [query]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [markdown]);

  return (
    <div className="flex flex-col gap-8">
      <Query markdown={query}></Query>
      <Answer markdown={markdown} sources={sources}></Answer>
      <div ref={endRef}></div>
      <Sources sources={sources}></Sources>
      <Relates relates={relates}></Relates>
      {error && (
        <div className="absolute inset-4 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="p-4 bg-white shadow-2xl rounded text-blue-500 font-medium flex gap-4">
            <Annoyed></Annoyed>
            {error === 429
              ? "Sorry, you have made too many requests recently, try again later."
              : "Sorry, we might be overloaded, try again later."}
          </div>
        </div>
      )}
    </div>
  );
};
