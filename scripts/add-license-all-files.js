// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

const fs = require("fs");
const path = require("path");

const headerMap = {
  ".ts": path.join(__dirname, "..", "COPYRIGHT_HEADER.txt"),
  ".js": path.join(__dirname, "..", "COPYRIGHT_HEADER.txt"),
  ".scss": path.join(__dirname, "..", "COPYRIGHT_HEADER.txt"),
  ".css": path.join(__dirname, "..", "COPYRIGHT_HEADER.txt"),
  ".vue": path.join(__dirname, "..", "COPYRIGHT_HEADER_vue.txt"),
};

function addHeader(filePath) {
  const ext = path.extname(filePath);
  const headerFile = headerMap[ext];
  if (!headerFile) return;

  const header = fs.readFileSync(headerFile, "utf-8").trim();
  const content = fs.readFileSync(filePath, "utf-8");

  if (content.startsWith(header)) return; // Skip if already has header

  const updated = `${header}\n${content}`;
  fs.writeFileSync(filePath, updated, "utf-8");
  console.log(`Added header to: ${filePath}`);
}

function findFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules and .git directories
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (entry.isFile() && headerMap[path.extname(entry.name)]) {
      files.push(fullPath);
    }
  }

  return files;
}

// Run script
const rootDir = process.argv[2] || '.';
const files = findFiles(rootDir);
console.log(`Found ${files.length} files to process`);
files.forEach(addHeader);