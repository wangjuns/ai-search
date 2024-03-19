"use client";
import { FC, RefObject } from "react";
import SearchResult from "../interfaces/ai-search-result";
import { PrevResult } from "./prev-result";
import { Result } from "./result";
import { nanoid } from "nanoid";
import { Message } from "../interfaces/message";


export const Results: FC<{
  results: RefObject<SearchResult[]>,
  query: string,
  append: (newResult: SearchResult) => void,
}> = ({ results, query, append }) => {
  const messages: Message[] = results.current!.flatMap(r => [
    { role: "user", content: r.query },
    { role: "assistant", content: r.answer }
  ])

  return (

    <div className="flex flex-col gap-12">
      {
        results.current!.map((result, index) => (
          <div key={index}>
            <PrevResult result={result} />
          </div>
        ))
      }

      {
        query && (<Result
          key={query}
          query={query}
          rid={nanoid()}
          messages={messages}
          append={append}
        />)
      }

    </div >
  );
};
