import { $ } from 'bun';

interface ReplObj {
  replstr: string;
  targetstr: string;
}

const generateRCContent = (template: string, replObj: ReplObj[]): string => {
  let result = template;
  replObj.map(({ replstr, targetstr }) => {
    const regex = new RegExp(replstr, 'g');
    result = result.replace(regex, targetstr);
  });
  return result;
};

// Env
const COMMANDS_RC_PATH = 'commands_install.sh';
const COMMANDS_INSTALL = (await $`pwd`.text()).trim();
const COMMANDS_INSTALL_BIN = `${COMMANDS_INSTALL}/bin`;

const generateInstall = async () => {
  const sampleContent = await Bun.file(`${COMMANDS_RC_PATH}.sample`).text();
  const commandAliasContent = await Bun.file('commands_alias.sh').text();

  const replaceTable: ReplObj[] = [
    {
      replstr: '__COMMANDS_INSTALL__',
      targetstr: COMMANDS_INSTALL,
    },
    {
      replstr: '__COMMANDS_INSTALL_BIN__',
      targetstr: COMMANDS_INSTALL_BIN,
    },
    {
      replstr: '## COMMANDS_ALIAS',
      targetstr: commandAliasContent,
    },
  ];
  const rcContent = generateRCContent(sampleContent, replaceTable);
  await Bun.write(COMMANDS_RC_PATH, rcContent);
};

generateInstall();
