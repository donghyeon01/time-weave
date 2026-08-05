"use client";

import { useState } from "react";
import {
  SchedulingForm,
  RecommendedSlots,
} from "@/components/SchedulingForm";
import type { RecommendedSlot } from "@/types/client";

export default function SchedulingPage() {
  const [slots, setSlots] = useState<RecommendedSlot[]>([]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">일정 조율</h1>

      <div className="mt-6">
        <SchedulingForm onResult={setSlots} />
        <RecommendedSlots slots={slots} />
      </div>
    </main>
  );
}
