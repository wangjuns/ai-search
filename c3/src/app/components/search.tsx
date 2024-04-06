"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState } from "react";

export const Search: FC<{ onSubmit: (e: FormEvent<HTMLFormElement>, value: string) => void }> = ({ onSubmit }) => {
  const [value, setValue] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value) {
          setValue("");
          onSubmit(e, value)
        }
      }}
    >
      <label
        className="relative bg-white flex items-center justify-center border ring-8 ring-zinc-300/20 py-2 px-2 rounded-lg gap-2 focus-within:border-zinc-300"
        htmlFor="search-bar"
      >
        <input
          id="search-bar"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          placeholder="Ask Lepton AI anything ..."
          className="px-2 pr-6 w-full rounded-md flex-1 outline-none bg-white"
        />
        <button
          type="submit"
          className="w-auto py-1 px-2 bg-black border-black text-white fill-white active:scale-95 border overflow-hidden relative rounded-xl"
        >
          <ArrowRight size={16} />
        </button>
      </label>
    </form >
  );
};
