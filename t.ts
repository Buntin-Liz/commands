import { $ } from 'bun';

const result = await $`
shell=$(getent passwd "$USER" | cut -d: -f7 2>/dev/null)
if [ -z "$shell" ]; then
  shell="-1"
fi

home=$(echo "$HOME" 2>/dev/null)
if [ -z "$home" ]; then
  home="-1"
fi

user=$(whoami 2>/dev/null)
if [ -z "$user" ]; then
  user="-1"
fi

# print result
echo "$shell $home $user"
`.text();

console.log(result);
