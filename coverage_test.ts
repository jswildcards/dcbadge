import { calculate } from "./coverage.ts";
import { assert } from "./deps.ts";

Deno.test("77.08%", function () {
  const url = calculate("jswildcards", "filedb");
  assert(
    url,
    "https://img.shields.io/badge/code%20coverage-77.08%25-yellowgreen.svg",
  );
});
