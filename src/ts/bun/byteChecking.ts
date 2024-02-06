#!/usr/bin/env bun
import { file, fileURLToPath } from 'bun';
import { parseArgs } from 'util';

const getPathsFromArgs = (): string[] => {
  const args: {
    values: {};
    positionals: string[];
  } = parseArgs({
    args: Bun.argv,
    options: {},
    strict: true,
    allowPositionals: true,
  });
  return args.positionals.slice(2);
};

const formatAndPrintTable = (table: string[][]): void => {
  const columnWidths = table[0].map((_, columnIndex) =>
    Math.max(...table.map((row) => row[columnIndex].length))
  );

  table.forEach((row) => {
    const formattedRow = row
      .map((cell, index) => {
        // 最初の列は左寄せ、それ以外は中央寄せ
        if (index === 0) {
          return cell.padEnd(columnWidths[index], ' ');
        } else {
          const totalPadding = columnWidths[index] - cell.length;
          const paddingLeft = Math.floor(totalPadding / 2);
          const paddingRight = totalPadding - paddingLeft;
          return ' '.repeat(paddingLeft) + cell + ' '.repeat(paddingRight);
        }
      })
      .join(' | ');
    console.log(formattedRow);
  });
};

const getFileStatus = async (
  filename: string
): Promise<{ volumes: [string, string]; exists: boolean }> => {
  const file = Bun.file(filename);
  if (!(await file.exists())) {
    return {
      volumes: ['N/A', 'N/A'],
      exists: false,
    };
  }
  const bytes = file.size;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const binaryUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const factor = 1000;
  const binaryFactor = 1024;

  let index = 0;
  let binaryIndex = 0;

  while (index < units.length - 1 && bytes >= factor ** (index + 1)) {
    index++;
  }

  while (
    binaryIndex < binaryUnits.length - 1 &&
    bytes >= binaryFactor ** (binaryIndex + 1)
  ) {
    binaryIndex++;
  }

  const decimalValue =
    (bytes / factor ** index).toFixed(1) + ' ' + units[index];
  const binaryValue =
    (bytes / binaryFactor ** binaryIndex).toFixed(1) +
    ' ' +
    binaryUnits[binaryIndex];

  return {
    volumes: [decimalValue, binaryValue],
    exists: true,
  };
};

(async () => {
  const filePaths = getPathsFromArgs();
  const table = [['File', 'Size', 'Size (binary)']];
  for (let file of filePaths) {
    const { exists, volumes } = await getFileStatus(file);
    table.push([file, exists ? '✅' : '❎', ...volumes]);
  }

  formatAndPrintTable(table);
})();
