/**
 * Example of importing a python module and running it.
 */

import { getPython } from "../mod.ts";

if (import.meta.main) {
  const { python } = await getPython();
  const result = await python.import("hello");
  const zen = await result.main();
  console.log("Received in JS:", zen.toString());
}
