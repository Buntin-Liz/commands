import { file, fileURLToPath } from 'bun';
import { parseArgs } from 'util';

//async function getFileSize(filePath: string): Promise<void>

type ArgsResult = {
  values: string[];
};

function getPathsFromArgs(): string[] {
  // parseArgsを使用して引数を解析
  const args = parseArgs({
    args: Bun.argv,
    options: {},
    strict: true,
    allowPositionals: true,
  });

  // valuesプロパティを取得し、最初の二つの要素を除外
  return (args as unknown as ArgsResult).values.slice(2);
}

// 使用例
const paths = getPathsFromArgs();
console.log(paths); // 最初の二つの要素を除外したPathの配列を表示

const getFileSize = async (filePath: string): Promise<void> => {
  // fileURLToPathを使用してファイルパスを変換
  const path = fileURLToPath(new URL(filePath, import.meta.url));

  // ファイルの情報を取得
  //const stats = await Bun.file(path).stat();
  const file = Bun.file(path);

  // ファイルサイズをKB単位で取得
  const sizeInKB = file.size / 1024;

  // KBをMB単位に変換し、両方を表示
  const sizeInMB = sizeInKB / 1024;
  console.log(`${sizeInMB.toFixed(2)}MB (${sizeInKB.toFixed(0)}KB)`);
};

// 例: 特定のファイルのサイズを取得
//getFileSize('file://path/to/your/file.txt');

(async () => {
  const filePaths = getPathsFromArgs();
  console.log(filePaths);

  //getFileSize(args._[0]);
})();
