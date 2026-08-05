"use client";

import { useState } from "react";
import { FriendList } from "@/components/FriendList";
import { FriendSearch } from "@/components/FriendSearch";
import { ReceivedRequests, SentRequests } from "@/components/FriendRequests";
import { Button } from "@/components/ui/Button";

type Tab = "list" | "received" | "sent" | "search";

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("list");

  const tabs: { key: Tab; label: string }[] = [
    { key: "list", label: "친구 목록" },
    { key: "received", label: "받은 요청" },
    { key: "sent", label: "보낸 요청" },
    { key: "search", label: "검색" },
  ];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">친구</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(({ key, label }) => (
          <Button
            key={key}
            onClick={() => setTab(key)}
            color={tab === key ? "primary" : "secondary"}
            className="px-4 py-2 text-sm"
            aria-pressed={tab === key}>
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "list" && <FriendList />}
        {tab === "received" && <ReceivedRequests />}
        {tab === "sent" && <SentRequests />}
        {tab === "search" && <FriendSearch />}
      </div>
    </main>
  );
}
