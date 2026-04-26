import { db } from "@/lib/db";
import { postMessageAction } from "@/lib/messages/actions";
import { cn } from "@/lib/utils";

export async function FlightThread({
  flightId,
  currentUserId,
}: {
  flightId: string;
  currentUserId: string;
}) {
  const messages = await db.flightMessage.findMany({
    where: { flightId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Flight thread</h2>
      <ul className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 && (
          <li className="text-sm text-slate-500">
            No messages yet. Start the conversation.
          </li>
        )}
        {messages.map((m) => {
          const mine = m.authorId === currentUserId;
          return (
            <li
              key={m.id}
              className={cn(
                "rounded-md border bg-navy-950 p-3",
                mine ? "border-amber-500/40" : "border-navy-700",
              )}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-medium">
                  <span className="text-amber-400">{m.author.name}</span>{" "}
                  <span className="text-slate-500">·</span>{" "}
                  <span className="text-slate-500 font-normal">{m.author.role}</span>
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(m.createdAt).toUTCString().slice(5, 22)} UTC
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{m.body}</p>
            </li>
          );
        })}
      </ul>
      <form
        action={postMessageAction as unknown as (fd: FormData) => void}
        className="space-y-2"
      >
        <input type="hidden" name="flightId" value={flightId} />
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={2}
          placeholder="Type a message..."
          className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-amber-400"
        >
          Send
        </button>
      </form>
    </section>
  );
}
