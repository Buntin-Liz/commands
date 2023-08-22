#!/usr/bin/env zx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("zx/globals");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const isbinaryfile_1 = require("isbinaryfile");
const searchFiles = async (dir, word) => {
    const files = await (0, promises_1.readdir)(dir);
    for (const file of files) {
        const filePath = (0, path_1.join)(dir, file);
        const stats = await (0, promises_1.stat)(filePath);
        if (stats.isDirectory()) {
            await searchFiles(filePath, word);
        }
        else if (!await (0, isbinaryfile_1.isBinaryFile)(filePath)) {
            const content = await (0, promises_1.readFile)(filePath, 'utf8');
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
    const word = process.argv[2];
    if (!word) {
        console.error('検索ワードを引数につけてください[ex: yurusearch {検索ワード}]');
        process.exit(1);
    }
    await searchFiles(process.cwd(), word);
})();
