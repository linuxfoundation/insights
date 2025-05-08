// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
const fs = require('fs');
const path = require('path');

const extensionsToCheck = ['.js', '.ts', '.jsx', '.tsx', '.vue'];
const headerMap = {
  '.vue': path.join(__dirname, '..', 'COPYRIGHT_HEADER_vue.txt'),
  'default': path.join(__dirname, '..', 'COPYRIGHT_HEADER.txt'),
};

function getAllFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name)) {
      getAllFiles(fullPath, fileList);
    } else if (
      entry.isFile() &&
      extensionsToCheck.some((ext) => entry.name.endsWith(ext))
    ) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function getHeader(ext) {
  const headerPath = headerMap[ext] || headerMap['default'];
  return fs.readFileSync(headerPath, 'utf-8').trim();
}

const files = getAllFiles('./');
let hasError = false;

for (const file of files) {
  const ext = path.extname(file);
  const header = getHeader(ext);
  const content = fs.readFileSync(file, 'utf-8').trim();

  if (!content.startsWith(header)) {
    console.error(`❌ Missing or incorrect license header in: ${file}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('🚫 License check failed.');
  process.exit(1);
} else {
  console.log('✅ All files contain the correct license header.');
}