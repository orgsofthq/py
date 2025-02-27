# @orgsoft/py

A Deno Python wrapper that supports using virtual environments like from `uv`.

This lets you easily call Python modules from Deno code: in a portable, simple,
and low setup way.

`@orgsoft/py` is based on
[`jsr:@denosaurs/python`](https://jsr.io/@denosaurs/python) and its native
Python/C bindings. You can read more about that and further documentation on
their [GitHub repo](https://github.com/denosaurs/deno_python).

## Usage

There are two ways to use this module, either from code or command-line.

### Typescript Usage

This is the recommended way to use this module.

```ts
import { getPython } from "jsr:@orgsoft/py";
const { python } = await getPython();

# Import a module and run a function
const module = await python.import("my_module");
const result = await module.main();
console.log(result);

# Run raw python code
python.run("print('hello world'));

# Continued...
const np = python.import("numpy");
const plt = python.import("matplotlib.pyplot");

const xpoints = np.array([1, 8]);
const ypoints = np.array([3, 10]);

plt.plot(xpoints, ypoints);
plt.show();
```

### CLI Usage

This isn't particularly useful aside for testing, as you're better off using
`python run` or `uv run` directly. But, maybe someone needs it..

```sh
deno run --allow-ffi --allow-env --allow-read --allow-run jsr:@orgsoft/py/mod.ts <python_module>
```

You could also install `@orgsoft/py` so it can be accessed quickly:

```sh
deno install -frAg --name denopy jsr:@orgsoft/py/mod.ts
denopy my_python_module
```

Replace `denopy` with any alias name you'd like.

## Setup notes

[Deno](https://deno.com) must be installed to use.

You also must source a virtual environment to use `@orgsoft/py`:

```sh
source .venv/bin/activate
```

If you are using a different venv path, run:

```sh
source {MY_PYTHON_PROJECT_PATH}/.venv/bin/activate
```

We recommend using [`uv`](https://docs.astral.sh/uv/) to create your virtual
environment.

Then, run:

```sh
uv init
uv sync
source .venv/bin/activate
```

to create and activate your virtual environment.

## Example

Go to [example](/example).

✌️
