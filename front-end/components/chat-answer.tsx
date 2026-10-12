"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { citationMarkers } from "@/lib/citation-markers";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface ChatSource {
  id?: string;
  label?: string;
  metadata?: { filename?: string; chunk?: string };
}

function Citation({ source, number }: { source: ChatSource; number: string }) {
  const filename = source.metadata?.filename || "Study material";
  const excerpt =
    source.metadata?.chunk || "No excerpt is available for this saved source.";
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex align-baseline rounded px-1 text-xs font-semibold accent bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label={`Source ${number}: ${filename}`}
            >
              [{number}]
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[min(24rem,calc(100vw-2rem))] p-3"
        >
          <p className="font-semibold break-words mb-2">{filename}</p>
          <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words leading-5">
            {excerpt}
          </p>
        </TooltipContent>
        <DialogContent className="max-w-[min(40rem,calc(100vw-2rem))]">
          <DialogTitle className="break-words pr-5">{filename}</DialogTitle>
          <DialogDescription>
            Source {number} · Retrieved passage
          </DialogDescription>
          <div className="max-h-[60dvh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-7">
            {excerpt}
          </div>
        </DialogContent>
      </Tooltip>
    </Dialog>
  );
}

export function ChatAnswer({
  content,
  sources = [],
}: {
  content: string;
  sources?: ChatSource[];
}) {
  const lookup = new Map(
    sources.map((source, index) => [source.id || `S${index + 1}`, source]),
  );
  return (
    <TooltipProvider delayDuration={200}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, citationMarkers]}
        components={{
          a: ({ href, children, ...props }) => {
            const match = href?.match(/^#studymate-citation-(S\d+)$/);
            if (match) {
              const source = lookup.get(match[1]);
              return source ? (
                <Citation source={source} number={match[1].slice(1)} />
              ) : (
                <>{children}</>
              );
            }
            return (
              <a href={href} {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </TooltipProvider>
  );
}
