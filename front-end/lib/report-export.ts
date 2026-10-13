import type { ChatSource } from "@/components/chat-answer";
export function reportMarkdown(content: string, sources: ChatSource[]) {
  const references = sources
    .map((source, index) => ({ source, id: source.id || `S${index + 1}` }))
    .filter(({ id }) => content.includes(`[${id}]`))
    .map(
      ({ source, id }) =>
        `[${id.slice(1)}] ${source.metadata?.filename || "Study material"}\n\n${(
          source.metadata?.chunk || "Excerpt unavailable."
        )
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n")}`,
    );
  return (
    content.replace(/\[S(\d+)\]/g, "[$1]") +
    "\n\n## Source references\n\n" +
    references.join("\n\n") +
    "\n"
  );
}
