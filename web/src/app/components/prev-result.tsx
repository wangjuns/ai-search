"use client";
import { Answer } from "@/app/components/answer";
import { Sources } from "@/app/components/sources";
import { FC } from "react";
import SearchResult from "../interfaces/ai-search-result";
import { Query } from "./query";

export const PrevResult: FC<{ result: SearchResult }> = ({ result }) => {

  return (
    <div className="flex flex-col gap-8">
      <Query markdown={result.query}></Query>
      <Answer markdown={result.answer} sources={result.sources}></Answer>
      <Sources sources={result.sources}></Sources>
    </div>
  );
};
