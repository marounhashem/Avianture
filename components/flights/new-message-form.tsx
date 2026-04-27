"use client";

import { useRef, useTransition } from "react";
import { postMessageAction } from "@/lib/messages/actions";

export function NewMessageForm({ flightId }: { flightId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd: FormData) => {
        startTransition(async () => {
          const res = await postMessageAction(fd);
          if (!res?.error) {
            formRef.current?.reset();
          }
        });
      }}
      className="space-y-2"
    >
      <input type="hidden" name="flightId" value={flightId} />
      <textarea
        name="body"
        required
        maxLength={2000}
        rows={2}
        placeholder="Type a message..."
        disabled={pending}
        className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
