import { ensureFileSync } from "./deps.ts";

export async function calculate(username: string, repo: string) {
  const prebuild1 = Deno.run({
    cmd: ["curl", "https://raw.githubusercontent.com/jswildcards/dcbadge/develop/build.sh"],
    stdout: "piped"
  });

  const output = await prebuild1.output();
  prebuild1.close();

  const buildsh = new TextDecoder().decode(output);
  ensureFileSync("dcbadge-tests/build.sh");
  Deno.writeTextFileSync("dcbadge-tests/build.sh", buildsh);

  const prebuild2 = Deno.run({
    cmd: ["sh", "dcbadge-tests/build.sh", `https://github.com/${username}/${repo}`],
  });

  await prebuild2.status();
  prebuild2.close();

  const test_result = Deno.readTextFileSync("dcbadge-tests/test_result.txt");
  const coverage_lines = test_result.split("\n").filter((line) =>
    line.includes("cover file:/")
  );

  const coverage = Math.round(
    coverage_lines.map((line) =>
      parseFloat(
        line.split(" ").find((word) => word.includes("%"))?.replace("%", "")!,
      )
    ).reduce((prev, cur) => prev + cur, 0) / coverage_lines.length * 100,
  ) / 100;

  const color = coverage >= 80
    ? "brightgreen"
    : (coverage >= 60 ? "yellowgreen"
    : (coverage >= 40 ? "yellow" : (coverage >= 20 ? "orange" : "red")));

  const url =
    `https://img.shields.io/badge/code%20coverage-${coverage}%25-${color}.svg`;

  const postbuild = Deno.run({
    cmd: ["rm", "-rf", "dcbadge-tests"],
  });

  await postbuild.status();
  postbuild.close();

  return url;
}
