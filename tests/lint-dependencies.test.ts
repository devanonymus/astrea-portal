import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const pluginRequire = createRequire(require.resolve("@next/eslint-plugin-next"));
const { getRootDirs } = pluginRequire("./utils/get-root-dirs.js");

test("Next lint resolves root directory globs through the safe replacement", () => {
  const root = mkdtempSync(join(tmpdir(), "astrea-lint-"));
  try {
    mkdirSync(join(root, "apps", "portal"), { recursive: true });
    mkdirSync(join(root, "apps", "other"), { recursive: true });
    writeFileSync(join(root, "apps", "file.txt"), "fixture");
    const context = (rootDir?: string | string[]) => ({ cwd: root, settings: { next: { rootDir } } });
    assert.deepEqual(getRootDirs(context()), [root]);
    const directories = (rootDir: string | string[]) => getRootDirs(context(rootDir)).map((path: string) => resolve(path));
    assert.deepEqual(directories(`${root}/apps/*`).sort(), [join(root, "apps", "other"), join(root, "apps", "portal")].sort());
    assert.deepEqual(directories([`${root}/apps/p*`]), [join(root, "apps", "portal")]);
    assert.deepEqual(getRootDirs(context(`${root}/missing/*`)), []);
    assert.equal(pluginRequire("fast-glob/package.json").name, "tinyglobby");
    assert.throws(() => pluginRequire.resolve("braces"), { code: "MODULE_NOT_FOUND" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
