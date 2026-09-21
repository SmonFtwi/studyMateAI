const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the page's effects and controls with deterministic API responses.
function mount(historyApi) {
  const slots = [];
  let index = 0;
  let effects = [];
  const react = {
    useState(initial) {
      const i = index++;
      if (!(i in slots)) slots[i] = initial;
      return [
        slots[i],
        (value) => {
          slots[i] = typeof value === "function" ? value(slots[i]) : value;
        },
      ];
    },
    useRef(initial) {
      const i = index++;
      return (slots[i] ||= { current: initial });
    },
    useCallback(fn, deps) {
      const i = index++;
      if (!slots[i] || deps.some((v, j) => v !== slots[i].deps[j]))
        slots[i] = { fn, deps };
      return slots[i].fn;
    },
    useEffect(fn, deps) {
      const i = index++;
      if (!slots[i] || deps.some((v, j) => v !== slots[i][j])) {
        slots[i] = deps;
        effects.push(fn);
      }
    },
  };
  const api = {
    getProjects: async () => ({ projects: [] }),
    getProjectFiles: async () => ({ files: [] }),
    getFlashcards: async () => ({}),
    getQuiz: async () => ({}),
    getChatSessions: async () => ({
      sessions: [
        { _id: "latest", title: "Saved conversation" },
        { _id: "older", title: "Older conversation" },
      ],
    }),
    getChatMessages: historyApi,
  };
  const exports = {};
  const compiled = ts.transpileModule(
    fs.readFileSync(
      require("node:path").join(
        __dirname,
        "../app/Dashboard/projects/[project_id]/page.tsx",
      ),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
      },
    },
  );
  vm.runInNewContext(compiled.outputText, {
    exports,
    console,
    window: { addEventListener() {}, removeEventListener() {} },
    localStorage: { getItem: () => "test-token" },
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime")
        return {
          jsx: (type, props) => ({ type, props }),
          jsxs: (type, props) => ({ type, props }),
        };
      if (name === "@/lib/apicall/project") return api;
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  const page = exports.default({ params: { project_id: "project" } });
  function render() {
    index = 0;
    const tree = page.type(page.props);
    const pending = effects;
    effects = [];
    pending.forEach((fn) => fn());
    return tree;
  }
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return [];
    if (Array.isArray(tree)) return tree.flatMap(nodes);
    return [tree, ...nodes(tree.props?.children)];
  }
  return {
    render,
    find: (predicate) => nodes(render()).find(predicate),
    settle: async () => {
      await new Promise((resolve) => setImmediate(resolve));
      return render();
    },
  };
}

test("reopening a project restores saved messages; New chat clears the view", async () => {
  const calls = [];
  const app = mount(async (_, project, session) => {
    calls.push([project, session]);
    return {
      messages: [{ role: "assistant", content: `Saved answer: ${session}` }],
    };
  });
  app.render();
  await app.settle();
  assert.deepEqual(calls, [["project", "latest"]]);
  assert.equal(
    app.find((n) => n.props?.id === "conversation").props.value,
    "latest",
  );
  assert.ok(app.find((n) => n.props?.children === "Saved answer: latest"));
  await app
    .find((n) => n.props?.id === "conversation")
    .props.onChange({ target: { value: "older" } });
  await app.settle();
  assert.ok(app.find((n) => n.props?.children === "Saved answer: older"));
  const newChat = app.find(
    (n) =>
      Array.isArray(n.props?.children) && n.props.children.includes("New chat"),
  );
  await newChat.props.onClick();
  assert.equal(app.find((n) => n.props?.id === "conversation").props.value, "");
  assert.equal(
    app.find((n) => n.props?.children === "Saved answer: older"),
    undefined,
  );
});

test("failed saved history can be retried with Reload", async () => {
  let fail = true;
  const app = mount(async () => {
    if (fail) throw new Error("offline");
    return { messages: [{ role: "assistant", content: "Recovered answer" }] };
  });
  app.render();
  await app.settle();
  assert.ok(
    app.find(
      (n) =>
        typeof n.props?.children === "string" &&
        n.props.children.includes("Use Reload"),
    ),
  );
  fail = false;
  const reload = app.find(
    (n) => n.props?.onClick && n.props?.children === "Reload project",
  );
  assert.ok(reload);
  await reload.props.onClick();
  assert.ok(app.find((n) => n.props?.children === "Recovered answer"));
});

test("uncited retrieved excerpts are hidden, while actual citations remain visible", async () => {
  const sources = [1, 2].map(n => ({ label: `Source ${n}`, metadata: { filename: 'Notes.pdf', chunk: `Excerpt ${n}` } }));
  const app = mount(async () => ({ messages: [
    { role: 'assistant', content: "I don't have enough information in the uploaded sources.", sources },
  ] }));
  app.render(); await app.settle();
  assert.equal(app.find(n => n.type === 'details'), undefined);
  const cited = mount(async () => ({ messages: [
    { role: 'assistant', content: 'A supported answer [S2]', sources },
  ] }));
  cited.render(); await cited.settle();
  assert.ok(cited.find(n => n.type === 'details'));
  assert.ok(cited.find(n => n.props?.children === 'Excerpt 2'));
  assert.equal(cited.find(n => n.props?.children === 'Excerpt 1'), undefined);
});
