import { $ } from 'bun';

const auto_init_mess = 'Hello, Bun & Deployment Advanced Framework!';

//update bun
//`bun upgrade`

await $`echo "${auto_init_mess}"`;
