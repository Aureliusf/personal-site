#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import YAML from 'yaml';
import { PDFDocument } from './pdf-document';
import { resumeSchema } from './schema';

function printUsage(): void {
  console.log('Usage: npm run resume:render -- <resume.yaml> [output.pdf]');
}

const [, , inputArgument, outputArgument] = process.argv;

if (!inputArgument || inputArgument === '--help' || inputArgument === '-h') {
  printUsage();
  process.exit(inputArgument ? 0 : 1);
}

const inputPath = path.resolve(inputArgument);
const outputPath = path.resolve(
  outputArgument
    ?? inputArgument.replace(/\.ya?ml$/i, '') + '.pdf',
);

try {
  const yamlText = await readFile(inputPath, 'utf8');
  const parsedYaml = YAML.parse(yamlText);
  const parsedResume = resumeSchema.safeParse(parsedYaml);

  if (!parsedResume.success) {
    const details = parsedResume.error.issues
      .map((issue) => `${issue.path.map(String).join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Resume validation failed:\n${details}`);
  }

  const pdf = await renderToBuffer(
    <PDFDocument resume={parsedResume.data} selectedBullets={new Map()} />,
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, pdf);
    await rename(temporaryPath, outputPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }

  console.log(`Rendered ${path.relative(process.cwd(), outputPath) || outputPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Render failed: ${message}`);
  process.exit(1);
}
