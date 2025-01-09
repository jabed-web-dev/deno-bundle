# deno-bundle

## Install

```bash
deno install -g -RWE --allow-run jsr:@trx/deno-bundle
# run subcommand deno check
```

\
**Description:**

deno-bundle is a Deno module designed to simplify bundling Deno projects into a single file. It provides a streamlined way to package and distribute your Deno applications by leveraging Deno's built-in deno bundle functionality. This package aims to automate the process, making it easier for developers to build and deploy their projects.

\
**Features:**
- Easy bundling of Deno projects into a single file.
- Automatically resolves dependencies.
- Supports custom configurations for bundling.
- Simplifies deployment workflows for Deno applications.

\
**CLI Usage:**
```
deno-bundle -h|--help

Usage:
  <url>         The entry point file to bundle (required)
  <outfile>?    The output file (default: entryfile.js)
  --type=?      Module type: esm | ife (default: esm)
  --check=?     Enable type checking: on | off (default: on)
  --minify      Minify the output file
  --sourceMap   Generate source maps

  Example:
    deno-bundle src/main.ts dist/bundle.js --minify --sourceMap
```

**Example Module Usage:**
```ts
import { bundle } from "@trx/deno-bundle";

await bundle("./src/main.ts", "./dist/bundle.js");
```