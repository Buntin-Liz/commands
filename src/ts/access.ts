#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import parseArgs from "https://deno.land/x/deno_minimist@v1.0.2/mod.ts";

const args = parseArgs(Deno.args);

if (args._.length !== 3 || args.h || args.help) {
  console.log("Usage: access <hostname> <local_port> <remote_port>");
  Deno.exit(1);
}

const [hostname, localPort, remotePort] = args._.map(String);

(async () => {
  const sshProcess = $`ssh -N -L ${ localPort }:localhost:${ remotePort } ${ hostname }`;
  console.log(`Port forwarding with SSH started on ${ localPort }:localhost:${ remotePort }. Press Ctrl+C to stop.`);
  await sshProcess;
})();
