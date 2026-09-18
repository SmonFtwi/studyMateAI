const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadApi(file, response) {
  const source = fs.readFileSync(
    path.join(__dirname, "../lib/apicall", file),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const exports = {};
  vm.runInNewContext(compiled.outputText, {
    exports,
    process: { env: { NEXT_PUBLIC_backend_url: "http://fixture.test" } },
    fetch: async () => response,
    console,
  });
  return exports;
}
const registration = {
  name: "Demo",
  email: "demo@example.test",
  password: "fixture",
  confirmPassword: "fixture",
};

test("registration supports accounts awaiting email confirmation without a token", async () => {
  const api = loadApi(
    "user.ts",
    new Response(
      JSON.stringify({ token: null, message: "Confirm your email" }),
      { status: 201 },
    ),
  );
  const result = await api.registerUser(registration);
  assert.equal(result.token, null);
  assert.equal(result.message, "Confirm your email");
});

test("registration returns the immediate sign-in token", async () => {
  const api = loadApi(
    "user.ts",
    new Response(JSON.stringify({ token: "fixture-token" }), { status: 201 }),
  );
  assert.equal((await api.registerUser(registration)).token, "fixture-token");
});

test("registration rejects a backend failure rather than treating it as success", async () => {
  const api = loadApi(
    "user.ts",
    new Response(JSON.stringify({ error: "Email already registered" }), {
      status: 409,
    }),
  );
  await assert.rejects(
    api.registerUser(registration),
    /Email already registered/,
  );
});

test("chat retains approval responses instead of treating HTTP 202 as an error", async () => {
  const api = loadApi(
    "project.ts",
    new Response(JSON.stringify({ approval_id: "approval-1" }), {
      status: 202,
    }),
  );
  assert.equal(
    (await api.sendChatMessage("fixture", "p", "s", "Question")).approval_id,
    "approval-1",
  );
});

test("chat errors expose a readable backend message", async () => {
  const api = loadApi(
    "project.ts",
    new Response(JSON.stringify({ error: "Add a source first" }), {
      status: 400,
    }),
  );
  await assert.rejects(
    api.sendChatMessage("fixture", "p", "s", "Question"),
    /Add a source first/,
  );
});

test("non-JSON service failures receive a safe readable fallback", async () => {
  const api = loadApi(
    "project.ts",
    new Response("<html>Gateway unavailable</html>", { status: 502 }),
  );
  await assert.rejects(
    api.sendChatMessage("fixture", "p", "s", "Question"),
    /Please try again/,
  );
});
