// utils/docuseal.js

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
export async function downloadSignedDocument(submissionId) {
  const API_KEY = process.env.DOCUSEAL_API_KEY;
  const res = await fetch(
    `https://api.docuseal.com/submissions/${submissionId}/documents`,
    {
      headers: { "X-Auth-Token": API_KEY}
    }
  );

  if (!res.ok) throw new Error("Failed to fetch DocuSeal documents");

  const data = await res.json();
  // Signed PDFs are here:
  // data.documents[0].url
  return data.documents;
}

export async function savePdfFromUrl(url, savePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed downloading PDF");

  const buffer = await res.arrayBuffer();
  fs.writeFileSync(savePath, Buffer.from(buffer));
  return savePath;
}

export async function fetchSignedDocuments(submissionId) {
  const apiKey = process.env.DOCUSEAL_API_KEY;

  const response = await fetch(
    `https://api.docuseal.com/submissions/${submissionId}/documents`,
    {
      headers: { "X-Auth-Token": apiKey },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch documents from DocuSeal");

  const data = await response.json();
  return data.documents;  // array of docs with .url
}
