import type { ChatSource } from "@/components/chat-answer";
export type ChatEvent =
  | { type: "sources"; data: { sources: ChatSource[] } }
  | { type: "delta"; data: { text: string } }
  | {
      type: "completion" | "approval-required";
      data: {
        message: { _id?: string; content: string };
        sources: ChatSource[];
        approval_id?: string;
      };
    }
  | { type: "error"; data: { message: string } };

export async function readChatStream<T = ChatEvent>(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: T) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let terminal = false;
  try {
    while (!terminal) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      buffer = buffer.replace(/\r\n/g, "\n");
      let end;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const lines = frame.split("\n");
        const type = lines
          .find((line) => line.startsWith("event:"))
          ?.slice(6)
          .trim();
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!type || !data) continue;
        onEvent({ type, data: JSON.parse(data) } as T);
        if (["completion", "approval-required", "error"].includes(type)) {
          terminal = true;
          break;
        }
      }
      if (done && !terminal)
        throw new Error(
          "The connection ended before the answer was saved. Reload the conversation.",
        );
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
