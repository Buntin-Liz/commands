// @ts-nocheck
import fs from 'fs';

type Section = {
  original: string;
  translated: string;
};

const parseSections = (content: string): Section[] => {
  const regex = /\*\*原文\*\*:\s*([\s\S]+?)\n\n\*\*訳文\*\*:\s*([\s\S]+?)(?=\n\n\*\*|$)/g;
  const sections: Section[] = [];

  let match;
  while ((match = regex.exec(content)) !== null) {
    sections.push({
      original: match[1].trim(),
      translated: match[2].trim(),
    });
  }

  return sections;
};

const clSection = (sec: Section): Section => {
  return {
    original: sec.original.replace(/---$/, '').trim(),
    translated: sec.translated.replace(/---$/, '').trim(),
  };
};

const replaceContentWithTranslation = (content: string, sections: Section[]): string => {
  let modifiedContent = content;
  for (const section of sections) {
    modifiedContent = modifiedContent.replace(section.original, section.translated);
  }
  return modifiedContent;
};

const translateMarkdown = (markdownPath: string, sections: Section[]): void => {
  const originalContent = fs.readFileSync(markdownPath, 'utf-8');
  const translatedContent = replaceContentWithTranslation(originalContent, sections);
  fs.writeFileSync(markdownPath, translatedContent);
};


(() => {
  const content = fs.readFileSync('./yakugo', 'utf-8');
  const parsed = parseSections(content).map(clSection);
  translateMarkdown('./README_jp.md', parsed);
})();

const parseContent = (content: string) => {
  const sections = content
    .split('---')
    .map((s) => s.trim())
    .filter(Boolean);
  const parsed = sections.map((s) => {
    const [original, translated] = s.split('\n\n').map((ss) => ss.trim());
    return {
      original,
      translated,
    };
  });
  return parsed;
};
const splitByLine = (content: string) => content.split('\n');

