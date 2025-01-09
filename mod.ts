#!/usr/bin/env deno run -RWE --allow-run

import { bundle } from "jsr:@deno/emit";

interface BundleOptions {
  entryPoint: string;
  outfile: string;
  type: "module" | "classic";
  minify: boolean;
  sourceMap: boolean;
  check: boolean;
}

// Type-check a file
async function typeCheck(filePath: string): Promise<void> {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["check", filePath],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, success, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  if (!success || code !== 0) {
    throw new Error(`Type-checking failed for ${filePath}:\n${stderrText}`);
  }

  console.log(`Type-checking successful for ${filePath}`);
  if (stdoutText) console.log(stdoutText);
}

// Bundle a file
async function bundleFile(options: BundleOptions): Promise<void> {
  const { code } = await bundle(options.entryPoint, {
    type: options.type,
    minify: options.minify,
    compilerOptions: {
      checkJs: options.check,
      inlineSourceMap: options.sourceMap,
    },
  });

  await Deno.mkdir(options.outfile.split("/").slice(0, -1).join("/"), { recursive: true });
  await Deno.writeTextFile(options.outfile, code);
  console.log(`Bundle saved to ${options.outfile}`);
}

// Parse CLI arguments
function parseArgs(args: string[]): BundleOptions {
  const defaults: BundleOptions = {
    entryPoint: "",
    outfile: "",
    type: "module",
    minify: false,
    sourceMap: false,
    check: true,
  };

  args.forEach((arg) => {
    if (arg.match(/-h|--help/)) showHelp();
    if (arg.startsWith("--")) {
      const [key, value] = arg.replace(/^--/, "").split("=");
      switch (key) {
        case "type":
          defaults.type = value === "ife" ? "classic" : "module";
          break;
        case "check":
          defaults.check = value !== "off";
          break;
        case "minify":
          defaults.minify = true;
          break;
        case "sourceMap":
          defaults.sourceMap = true;
          break;
        default:
          break;
      }
    } else {
      if (!defaults.entryPoint) {
        defaults.entryPoint = arg;
      } else if (!defaults.outfile) {
        defaults.outfile = arg;
      }
    }
  });

  if (!defaults.entryPoint) {
    console.error("Error: Missing required entry file. Use -h or --help for help.");
    Deno.exit(1);
  }

  defaults.outfile = defaults.outfile || defaults.entryPoint.replace(/\.(ts|tsx)$/, ".js");
  return defaults;
}

function color(text: string, code: number) {
  return `\x1b[${code}m${text}\x1b[0m`
}

// Show help message
function showHelp(): void {
  console.log(`
${color('Usage:', 1)}
  ${color('<url>', 36)}         The entry point file to bundle ${color('(required)', 95)}.
  ${color('<outfile>?', 36)}    The output file (default: entryfile.js).
  ${color('--type=?', 36)}      Module type: esm | ife (default: esm).
  ${color('--check=?', 36)}     Enable type checking: on | off (default: on).
  ${color('--minify', 36)}      Minify the output file.
  ${color('--sourceMap', 36)}   Generate source maps.

  Example:
    ${color('deno-bundle', 33)} main.ts main.js --type=esm --minify --sourceMap
  `);
  Deno.exit(0);
}

// Handle errors
function handleError(error: unknown): void {
  console.error("Error:", error instanceof Error ? error.message : String(error));
}

// Main function
async function main(options: BundleOptions): Promise<void> {
  try {
    if (options.check) await typeCheck(options.entryPoint);
    await bundleFile(options);
    console.log("\x1b[32mProcess completed successfully!\x1b[0m");
  } catch (error) {
    handleError(error);
    console.error("Process terminated due to errors.");
  }
}

// Entry point
if (import.meta.main) {
  const options = parseArgs(Deno.args);
  await main(options);
}

export type { BundleOptions };
export { main as bundle };
export default main;
