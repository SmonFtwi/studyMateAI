"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/authContext";
import { Button } from "@/components/ui/button";

interface Metrics {
  requests: number;
  p95_latency_ms: number;
  total_estimated_cost_usd: number;
  total_tokens: number;
  retrieval_hit_rate: number;
  grounded_answer_pass_rate: number;
  status_counts: Record<string, number>;
  recent_runs: {
    id: string;
    status: string;
    created_at: string;
    latency_ms: number;
    estimated_cost_usd: number;
    trace_id: string | null;
  }[];
}

export default function Analytics() {
  const { user } = useAuthContext();
  const [hours, setHours] = useState(24);
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const admin = user?.role === "admin";
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setData(null);
    fetch(
      `${process.env.NEXT_PUBLIC_backend_url}/${admin ? "ops/metrics" : "activity"}/summary?hours=${hours}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            response.status === 403
              ? "You don’t have access to workspace metrics."
              : "Couldn’t load activity. Please try again.",
          );
        const result = await response.json();
        if (!controller.signal.aborted) setData(result);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user, admin, hours, attempt]);
  const cards = data
    ? [
        ["Recorded chat runs", data.requests.toLocaleString()],
        [
          "95th percentile response time",
          data.requests ? `${(data.p95_latency_ms / 1000).toFixed(2)} s` : "—",
        ],
        [
          "Estimated generation cost",
          `$${data.total_estimated_cost_usd.toFixed(5)}`,
        ],
        ["Generation tokens", data.total_tokens.toLocaleString()],
        [
          "Runs with a retrieval hit",
          data.requests
            ? `${(data.retrieval_hit_rate * 100).toFixed(1)}%`
            : "—",
        ],
        [
          "Runs passing citation checks",
          data.requests
            ? `${(data.grounded_answer_pass_rate * 100).toFixed(1)}%`
            : "—",
        ],
      ]
    : [];
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">
            {admin ? "Workspace performance" : "Your study activity"}
          </p>
          <h1 className="page-heading">Analytics</h1>
          <p className="muted mt-3 text-sm">
            {admin
              ? "Recorded chat activity across all users."
              : "Recorded chat activity from your account only."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="metrics-window" className="text-sm">
            Time range
          </label>
          <select
            id="metrics-window"
            className="rounded-lg border p-2 bg-[var(--surface)]"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          >
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
            <option value={720}>Last 30 days</option>
          </select>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setAttempt((v) => v + 1)}
          >
            Refresh
          </Button>
        </div>
      </header>
      {loading && (
        <p role="status" className="notice">
          Loading activity…
        </p>
      )}
      {error && (
        <div role="alert" className="notice">
          {error}{" "}
          <button
            className="accent underline"
            onClick={() => setAttempt((v) => v + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {data && (
        <>
          {!data.requests && (
            <p className="notice">
              No chat runs recorded in this time range. Send a message in a
              project, then refresh.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border bg-[var(--surface)] p-5"
              >
                <p className="muted text-sm">{label}</p>
                <p className="text-2xl font-semibold mt-3">{value}</p>
              </div>
            ))}
          </div>
          <p className="muted text-sm leading-6">
            Rates include all recorded runs, including greetings and
            abstentions. Citation checks verify reference markers, not factual
            accuracy. Cost estimates cover recorded chat generation, excluding
            embeddings and unreported usage from failed requests.
          </p>
          <section className="rounded-xl border bg-[var(--surface)] p-5">
            <h2 className="font-semibold mb-4">Chat outcomes</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(data.status_counts).map(([status, count]) => (
                <span
                  key={status}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {status.replaceAll("_", " ")}: {count}
                </span>
              ))}
              {!data.requests && (
                <p className="muted text-sm">No outcomes yet.</p>
              )}
            </div>
          </section>
          <section className="rounded-xl border bg-[var(--surface)] p-5">
            <h2 className="font-semibold mb-4">Latest recorded runs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    {[
                      "Time",
                      "Outcome",
                      "Duration",
                      "Estimated cost",
                      ...(admin ? ["Trace ID"] : []),
                    ].map((label) => (
                      <th className="p-3 whitespace-nowrap" key={label}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recent_runs.map((run) => (
                    <tr key={run.id} className="border-b last:border-0">
                      <td className="p-3 whitespace-nowrap">
                        {new Date(run.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">{run.status.replaceAll("_", " ")}</td>
                      <td className="p-3 whitespace-nowrap">
                        {(run.latency_ms / 1000).toFixed(2)} s
                      </td>
                      <td className="p-3">
                        ${run.estimated_cost_usd.toFixed(5)}
                      </td>
                      {admin && (
                        <td className="p-3 font-mono text-xs break-all">
                          {run.trace_id || "Not recorded"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
