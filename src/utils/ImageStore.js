// src/utils/ImageStore.js
// Very small in-memory store for passing a captured image URI between screens.
// Not persisted — simple and works during the app lifetime.

let lastImageUri = null;
let lastPdfUri = null;

export function setCapturedImage(uri) {
  lastImageUri = uri;
}

export function getCapturedImage() {
  return lastImageUri;
}

export function clearCapturedImage() {
  lastImageUri = null;
}

export function setCapturedPdf(uri) {
  lastPdfUri = uri;
}

export function getCapturedPdf() {
  return lastPdfUri;
}

export function clearCapturedPdf() {
  lastPdfUri = null;
}
