import assert from "node:assert/strict";
import test from "node:test";

import {
  bundleVerifiedProviderEntrypoints,
  verifiedProviderEntrypoints,
} from "./build-verified-provider-entrypoints.mjs";

test("verified JS provider entrypoints bundle into one descriptor-safe file", async () => {
  const bundles = await bundleVerifiedProviderEntrypoints({ write: false });
  assert.equal(bundles.length, verifiedProviderEntrypoints.length);
  for (const { entrypoint, result } of bundles) {
    assert.equal(result.outputFiles?.length, 1, entrypoint.name);
    const source = result.outputFiles[0].text;
    assert.match(source, /^#!\/usr\/bin\/env node\n/);
  }
});
