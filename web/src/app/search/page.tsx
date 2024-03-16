"use client";
import { Search } from "@/app/components/search";
import { Title } from "@/app/components/title";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Results } from "../components/results";
import SearchResult from "../interfaces/ai-search-result";

interface SearchState {
  query?: string,
  results: SearchResult[],
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = decodeURIComponent(searchParams.get("q") || "")
  const rid = decodeURIComponent(searchParams.get("rid") || "");
  const resultsRef = useRef<SearchResult[]>([])
  const [query, setQuery] = useState<string>(q)
  const [searchState, setSearchState] = useState<SearchState>({ query: q, results: [] })

  const append = (newResult: SearchResult) => {
    resultsRef.current = [...resultsRef.current, newResult];
  };

  return (
    <div className="absolute inset-0 bg-[url('/ui/bg.svg')]">
      <div className="mx-auto max-w-3xl absolute inset-4 md:inset-8 bg-white">
        <div className="h-20 pointer-events-none rounded-t-2xl w-full backdrop-filter absolute top-0 bg-gradient-to-t from-transparent to-white [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="px-4 md:px-8 pt-6 pb-24 rounded-2xl ring-8 ring-zinc-300/20 border border-zinc-200 h-full overflow-auto">
          <Title query={query}></Title>

          <Results
            results={resultsRef}
            query={query}
            append={append}
          />
        </div>
        <div className="h-80 pointer-events-none w-full rounded-b-2xl backdrop-filter absolute bottom-0 bg-gradient-to-b from-transparent to-white [mask-image:linear-gradient(to_top,white,transparent)]"></div>
        <div className="absolute z-10 flex items-center justify-center bottom-6 px-4 md:px-8 w-full">
          <div className="w-full">
            <Search
              onSubmit={(e, value) => {
                setQuery(value)
              }}
            />
          </div>
        </div>
      </div>
    </div >
  );
}
