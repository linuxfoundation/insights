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
}

// Run script
const files = process.argv.slice(2);
files.forEach(addHeader);