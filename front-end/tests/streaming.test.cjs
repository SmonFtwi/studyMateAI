const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");
function load(file) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "../lib", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
        },
      },
    ).outputText,
    { exports, TextDecoder },
  );
  return exports;
}
const { readChatStream } = load("chat-stream.ts");
function body(text) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({
    start(c) {
      for (const b of bytes) c.enqueue(Uint8Array.of(b));
      c.close();
    },
  });
}
test("SSE handles split UTF-8, CRLF, heartbeats and final replacement", async () => {
  let text = "";
  const events = [];
  await readChatStream(
    body(
      ': heartbeat\r\n\r\nevent: delta\r\ndata: {"text":"hé🌍"}\r\n\r\nevent: completion\r\ndata: {"message":{"content":"Validated answer"},"sources":[]}\r\n\r\n',
    ),
    (e) => {
      events.push(e.type);
      text = e.type === "delta" ? text + e.data.text : e.data.message.content;
    },
  );
  assert.deepEqual(events, ["delta", "completion"]);
  assert.equal(text, "Validated answer");
});
test("an early EOF is an interruption, not a completed answer", async () => {
  await assert.rejects(
    readChatStream(
      body('event: delta\ndata: {"text":"partial"}\n\n'),
      () => {},
    ),
    /before the answer was saved/,
  );
});
test("approval and error are terminal events", async () => {
  for (const type of ["approval-required", "error"]) {
    const events = [];
    await readChatStream(body(`event: ${type}\ndata: {}\n\n`), (e) =>
      events.push(e.type),
    );
    assert.deepEqual(events, [type]);
  }
});
test("citation transform excludes code and existing links and preserves incomplete markers", () => {
  const { citationMarkers } = load("citation-markers.ts");
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Fact [S1] repeated [S1] other [S2] incomplete [S",
          },
        ],
      },
      { type: "inlineCode", value: "[S1]" },
      { type: "code", value: "[S2]" },
      {
        type: "link",
        url: "https://example.com",
        children: [{ type: "text", value: "[S1]" }],
      },
    ],
  };
  citationMarkers()(tree);
  assert.equal(
    tree.children[0].children.filter((n) => n.type === "link").length,
    3,
  );
  assert.equal(tree.children[0].children.at(-1).value, " incomplete [S");
  assert.equal(tree.children[1].value, "[S1]");
  assert.equal(tree.children[2].value, "[S2]");
  assert.equal(tree.children[3].children[0].type, "text");
});

test("report export includes only cited source snapshots", () => {
  const { reportMarkdown } = load("report-export.ts");
  const result = reportMarkdown("# Title\nClaim [S2]", [
    { id: "S1", metadata: { filename: "unused.pdf", chunk: "Unused" } },
    {
      id: "S2",
      metadata: { filename: "used.pdf", chunk: "Original\npassage" },
    },
  ]);
  assert.ok(result.includes("Claim [2]"));
  assert.ok(result.includes("[2] used.pdf"));
  assert.ok(result.includes("> Original\n> passage"));
  assert.ok(!result.includes("unused.pdf"));
});
