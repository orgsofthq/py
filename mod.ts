/**
 * NOTE: you should run
 * ```
 * uv init
 * uv sync
 * source .venv/bin/activate
 * ```
 * before using this module.
 */

import { $ } from "jsr:@david/dax@^0.42.0";
import { dirname, join } from "jsr:@std/path@1";

let py: typeof import("jsr:@denosaurs/python@0.4") | undefined;

/**
 * Gets a python interpreter interface with the python path
 * set up. This allows you to use uv, venv, etc.
 *
 * Most of the time, you will use `import` on this object,
 * and also make use of some common built-ins attached to
 * this object, such as `str`, `int`, `tuple`, etc.
 *
 * NOTE: You should source a python virtual environment before using
 * this module.
 *
 * If you are using uv, you can run:
 * ```
 * uv init
 * uv sync
 * source .venv/bin/activate
 * ```
 *
 * If you are using a different venv path, run:
 * ```
 * source {MY_PYTHON_PROJECT_PATH}/.venv/bin/activate
 * ```
 *
 * Learn more about uv at https://docs.astral.sh/uv/
 */
export const getPython = async (): Promise<
  typeof import("jsr:@denosaurs/python@0.4")
> => {
  if (py) {
    return py;
  }

  const venvDir = Deno.env.get("VIRTUAL_ENV");
  if (!venvDir) {
    if (Deno.env.get("ORGSOFT_PY_NO_WARNING") !== "true") {
      console.warn(
        `%c
⚠️ Warning: \`VIRTUAL_ENV\` is not set. In order to use @orgsoft/py as recommended,
you should first activate a virtual environment in your active shell with:

%c\`\`\`sh
source .venv/bin/activate
\`\`\`%c

If you are using a different venv path, run:

%c\`\`\`sh
source {MY_PYTHON_PROJECT_PATH}/.venv/bin/activate
\`\`\`%c

We recommend using uv to create your virtual environment. 

Get uv from: https://docs.astral.sh/uv/

Then, run:

%c\`\`\`sh
uv init
uv sync
source .venv/bin/activate
\`\`\`%c

to create and activate your virtual environment.

You can disable this warning by setting the environment variable:

%c\`\`\`sh
ORGSOFT_PY_NO_WARNING=true
\`\`\`
      `,
      "color:yellow",
      "color:purple",
      "color:yellow",
      "color:purple",
      "color:yellow",
      "color:purple",
      "color:yellow",
      "color:purple",
    );
    }

    return await import("jsr:@denosaurs/python@0.4");
  }

  // We need to bootstrap the python path with an existing python command
  const pythonPath =
    await $`python -c 'import sysconfig, os; print(os.path.join(sysconfig.get_config_var("LIBDIR"), sysconfig.get_config_var("INSTSONAME")))'`
      .text();

  const home = dirname(dirname(pythonPath));

  // get first subdir of sitePackagesDir
  const sitePackagesDir = join(venvDir, "lib");
  const iter = await Deno.readDir(sitePackagesDir);
  let firstSubdir: string | undefined;
  for await (const entry of iter) {
    firstSubdir = entry.name;
    break;
  }

  if (!firstSubdir && Deno.env.get("ORGSOFT_PY_NO_WARNING") !== "true") {
    console.warn(`%sNo packages found in ${sitePackagesDir}`, "color:yellow");
  }

  const sitePackagesPath = firstSubdir
    ? join(sitePackagesDir, firstSubdir, "site-packages")
    : undefined;

  Deno.env.set("DENO_PYTHON_PATH", pythonPath);
  Deno.env.set("PYTHONHOME", home);
  Deno.env.set("PYTHONPATH", sitePackagesPath ?? "");

  py = await import("jsr:@denosaurs/python@0.4");

  // Append current dir and sitePackagesPath to path
  py.python.run(`import sys
import os

sys.path.append(os.getcwd())
${sitePackagesPath ? `sys.path.append("${sitePackagesPath}")` : ""}
`);

  return py;
};

if (import.meta.main) {
  const { python } = await getPython();
  if (Deno.env.get("ORGSOFT_PY_NO_WARNING") !== "true") {
    console.warn(
      `"%c\n⚠️ Warning: No arguments provided, running main.py (if it exists)
  
Usage:
%c
  deno run --allow-ffi --allow-env --allow-read --allow-run jsr:@orgsoft/py/mod.ts <python_module>
%c
You can use orgsoft/py to run python code in code with:
%c
  import { getPython } from "jsr:@orgsoft/py";
  const { python } = await getPython();
  const module = await python.import("my_module");
  const result = await module.main();
  console.log(result);
%c
Disable this warning by setting the environment variable:
%c
  ORGSOFT_PY_NO_WARNING=true
`,
      "color:yellow",
      "color:purple",
      "color:yellow",
      "color:purple",
      "color:yellow",
      "color:purple",
    );
  }
  python.run("import runpy\nrunpy.run_module('main', run_name='__main__')");
}
