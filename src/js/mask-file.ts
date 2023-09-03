#!/usr/bin/env zx

import "zx/globals";
$.verbose = false;

const commandName = "mask-file";

await (async () => {
  //filter the commandName from argv._
  const targets = argv._.filter((t) => !t.includes("commands/" + commandName));
  const pwdp = await $`pwd`;

  const histories = await Promise.all(
    targets.map(async (target) => {
      await $`mv ${target} ${target}.m`;
      return path.join(pwdp.stdout.trim(), `${target}.m`);
    })
  );

  histories.forEach((t) => echo(t));
})();
