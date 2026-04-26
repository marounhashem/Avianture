import Link from "next/link";
import { db } from "@/lib/db";
import {
  postMessageAction,
  editMessageAction,
  deleteMessageAction,
} from "@/lib/messages/actions";
import { parseMentions } from "@/lib/messages/mentions";
import { getInterestedUsers } from "@/lib/flights/interested-users";
import { cn } from "@/lib/utils";

export async function FlightThread({
  flightId,
  currentUserId,
  basePath,
  editingMessageId,
}: {
  flightId: string;
  currentUserId: string;
  /** The path the thread lives on (e.g., `/app/flights/{id}`) — used to build edit/cancel links. */
  basePath: string;
  /** From searchParams: which message is currently being edited */
  editingMessageId?: string;
}) {
  const [messages, interested] = await Promise.all([
    db.flightMessage.findMany({
      where: { flightId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
    getInterestedUsers(flightId),
  ]);

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
          const isEditing = editingMessageId === m.id && mine && !m.deletedAt;

          if (m.deletedAt) {
            return (
              <li
                key={m.id}
                className="rounded-md border border-navy-700/50 bg-navy-950/50 p-3"
              >
                <p className="text-xs italic text-slate-500">
                  [message deleted ·{" "}
                  {new Date(m.deletedAt).toUTCString().slice(5, 22)} UTC]
                </p>
              </li>
            );
          }

          return (
            <li
              key={m.id}
              className={cn(
                "rounded-md border bg-navy-950 p-3",
                mine ? "border-amber-500/40" : "border-navy-700",
              )}
            >
              <div className="flex items-baseline justify-between mb-1 gap-2">
                <span className="text-xs font-medium">
                  <span className="text-amber-400">{m.author.name}</span>{" "}
                  <span className="text-slate-500">·</span>{" "}
                  <span className="text-slate-500 font-normal">
                    {m.author.role}
                  </span>
                </span>
                <span className="text-xs text-slate-500 shrink-0">
                  {new Date(m.createdAt).toUTCString().slice(5, 22)} UTC
                  {m.editedAt && (
                    <span className="ml-1 text-slate-600">(edited)</span>
                  )}
                </span>
              </div>
              {isEditing ? (
                <form
                  action={
                    editMessageAction as unknown as (fd: FormData) => void
                  }
                  className="mt-1 space-y-2"
                >
                  <input type="hidden" name="messageId" value={m.id} />
                  <textarea
                    name="body"
                    required
                    maxLength={2000}
                    rows={2}
                    defaultValue={m.body}
                    className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-amber-400"
                    >
                      Save
                    </button>
                    <Link
                      href={basePath}
                      className="text-xs text-slate-400 hover:text-amber-400"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">
                    {parseMentions(m.body, interested).map((seg, i) =>
                      seg.type === "mention" ? (
                        <span
                          key={i}
                          title={`${seg.user.name} · ${seg.user.email}`}
                          className="rounded bg-amber-500/15 px-1 font-medium text-amber-300"
                        >
                          @{seg.user.name.split(" ")[0]}
                        </span>
                      ) : (
                        <span key={i}>{seg.value}</span>
                      ),
                    )}
                  </p>
                  {mine && (
                    <div className="mt-2 flex items-center gap-3">
                      <Link
                        href={`${basePath}?edit=${m.id}`}
                        className="text-xs text-slate-500 hover:text-amber-400"
                      >
                        Edit
                      </Link>
                      <form
                        action={
                          deleteMessageAction as unknown as (
                            fd: FormData,
                          ) => void
                        }
                        className="inline"
                      >
                        <input type="hidden" name="messageId" value={m.id} />
                        <button
                          type="submit"
                          className="text-xs text-slate-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
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
