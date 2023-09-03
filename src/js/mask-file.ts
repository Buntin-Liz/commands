#!/usr/bin/env zx

import "zx/globals";
import path from "path";

$.verbose = false;

await (async () => {
  const targets = argv._;
  const pwdp = await $`pwd`;

  const histories = await Promise.all(
    targets.map(async (target) => {
      await $`mv ${target} ${target}.m`;
      return path.join(pwdp.stdout.trim(), `${target}.m`);
    })
  );

  histories.forEach((t) => echo(t));
})();
