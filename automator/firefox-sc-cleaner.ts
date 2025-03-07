#!/usr/bin/env bun

import { readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';

const home = process.env.HOME ?? '';
const DIR = join(home, 'Downloads');
const SCREENSHOT_DIR = join(home, 'Desktop');
const X_MAX = 100; // 最大ファイル名長

const printLog = (message: string) => {
  const date = new Date().toISOString();
  console.log(`${date}: ${message}`);
};

(async () => {
  const ffScRegex =
    /^Screenshot (\d{4}-\d{2}-\d{2}) at (\d{2})-(\d{2})-(\d{2})(?: (.*))?\.png$/;
  const univScRegex =
    /^スクリーンショット (\d{4}-\d{2}-\d{2}) (\d{2}).(\d{2}).(\d{2})(.*)\.png$/;

  try {
    const files = await readdir(DIR);
    for (const file of files) {
      let currentFile = file;
      const ffmatch = ffScRegex.exec(currentFile);
      if (ffmatch) {
        // firefox screenshot
        const suffix = '.png';
        const [, date, hh, mm, ss, title] = ffmatch;
        const convetedName = `スクリーンショット ${date} ${hh}.${mm}.${ss}_firefox_${title ?? 'no-title'}`;
        const newFileName = `${convetedName.length + suffix.length > X_MAX ? convetedName.slice(0, X_MAX - suffix.length) : convetedName}${suffix}`;
        const fullPath = join(DIR, currentFile);
        const newPath = join(DIR, newFileName);
        await rename(fullPath, newPath);
        printLog(`Renamed: ${file} -> ${newFileName}`);
        currentFile = newFileName;
      }
      const univmatch = univScRegex.exec(currentFile);
      if (univmatch) {
        // all screenshot
        const currentPath = join(DIR, currentFile);
        const scDirPath = join(SCREENSHOT_DIR, currentFile);
        await rename(currentPath, scDirPath);
        printLog(`Moved: ${currentPath} -> ${scDirPath}`);
      }
    }
  } catch (error) {
    console.log('Error:', error);
  }
})();
