"use client"

import { Footer } from "@/app/components/footer";
import { Logo } from "@/app/components/logo";
import { PresetQuery } from "@/app/components/preset-query";
import { Search } from "@/app/components/search";
import React from "react";
import { useRouter } from 'next/navigation'
import { UserMenu } from "./components/user-menu";
import { getSearchUrl } from "./utils/get-search-url";
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react"


export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  return (

    <div className="absolute inset-0 min-h-[500px] flex items-center justify-center">

      <div className="relative flex flex-col gap-8 px-4 -mt-24">
        {/* <UserMenu
          user={session?.user}
        /> */}
        <Logo></Logo>
        <Search onSubmit={(e, value) => {
          if (value) {
            router.push(getSearchUrl(encodeURIComponent(value), nanoid()));
          }
        }}></Search>
        <div className="flex gap-2 flex-wrap justify-center">
          <PresetQuery query="Who said live long and prosper?"></PresetQuery>
          <PresetQuery query="Why do we only see one side of the moon?"></PresetQuery>
        </div>
        <Footer></Footer>
      </div>
    </div >
  );
}
