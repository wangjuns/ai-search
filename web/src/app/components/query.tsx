import { Skeleton } from "@/app/components/skeleton";
import { Wrapper } from "@/app/components/wrapper";
import { MessageCircleQuestion } from "lucide-react";
import { FC } from "react";
import Markdown from "react-markdown";

export const Query: FC<{ markdown: string }> = ({
  markdown,

}) => {
  return (
    <Wrapper
      title={
        <>
          <MessageCircleQuestion></MessageCircleQuestion> Question
        </>
      }
      content={
        markdown ? (
          <div className="prose prose-sm max-w-full">
            <Markdown>
              {markdown}
            </Markdown>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="max-w-sm h-4 bg-zinc-200"></Skeleton>
            <Skeleton className="max-w-lg h-4 bg-zinc-200"></Skeleton>
            <Skeleton className="max-w-2xl h-4 bg-zinc-200"></Skeleton>
            <Skeleton className="max-w-lg h-4 bg-zinc-200"></Skeleton>
            <Skeleton className="max-w-xl h-4 bg-zinc-200"></Skeleton>
          </div>
        )
      }
    ></Wrapper>
  );
};
