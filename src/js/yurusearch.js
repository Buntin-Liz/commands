#!/usr/bin/env zx
import 'zx/globals';
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { isBinaryFile } from 'isbinaryfile';
//検索除外ディレクトリ名
const exclude = ['node_modules', '.git', '.vscode', 'testssl', '.cargo', '.cpan', '.local', '.cpanm', '.cpam', '.npm', '.pyenv', '.rbenv', '.rustup', '.volta'];
const searchFiles = async (dir, word) => {
    const files = await readdir(dir);
    for (const file of files) {
        if (exclude.includes(file))
            continue;
        const filePath = join(dir, file);
        echo(filePath);
        const stats = await stat(filePath);
        if (stats.isDirectory()) {
            //directory
            await searchFiles(filePath, word);
        }
        else if (stats.isFile() && !(await isBinaryFile(filePath))) {
            let content = '';
            try {
                content = await readFile(filePath, 'utf8');
            }
            catch (e) {
                continue;
            }
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes(word)) {
                    console.log(`${filePath}:${index + 1}`);
                }
            });
        }
    }
};
//main
(async () => {
    const word = process.argv[3];
    if (word === '-h' || word === '--help') {
        echo('Usage: yurusearch {検索ワード}');
        echo('現在のディレクトリ以下全てのファイルを検索します。\n検索ワードに引っかかると、そのファイルと行数を表示します。');
        process.exit(0);
    }
    echo `検索ワード: ${word}`;
    if (!word) {
        console.error('検索ワードを引数につけてください[ex: yurusearch {検索ワード}]');
        process.exit(1);
    }
    await searchFiles(process.cwd(), word);
})();
