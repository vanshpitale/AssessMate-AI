const { pdfToPng } = require('pdf-to-png-converter');
const { pathToFileURL } = require('url');
const fs = require('fs');
const path = require('path');

const MAX_PAGES = 5; // Limit pages to prevent Gemini token overflow

// Resolve pdfjs-dist cmaps as a valid file:// URL (required on Windows)
// pdfjs-dist expects a URL string, NOT a raw Windows path like C:\...\cmaps\
const pdfJsDistDir = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapUrl = pathToFileURL(path.join(pdfJsDistDir, 'cmaps')).href + '/';

/**
 * Converts a PDF file into an ordered array of PNG image paths.
 * Uses pdf-to-png-converter (pure JS, no ImageMagick/GhostScript needed).
 *
 * @param {string} pdfPath    - Absolute path to the input PDF file
 * @param {string} outputDir  - Directory where PNG images will be saved
 * @returns {Promise<string[]>} - Ordered array of absolute image paths
 */
async function convertPdfToImages(pdfPath, outputDir) {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfBaseName = path.basename(pdfPath, path.extname(pdfPath));

  // pagesToProcess = [1, 2, …, MAX_PAGES]
  // pdfToPng handles PDFs shorter than MAX_PAGES gracefully
  const pagesToProcess = Array.from({ length: MAX_PAGES }, (_, i) => i + 1);

  // pdf-to-png-converter resolves outputFolder as: path.join(process.cwd(), outputFolder)
  // On Windows, passing an absolute path doubles it: C:\backend\C:\backend\temp_images
  // Fix: pass a relative path so the library builds the correct absolute path internally
  const relativeOutputDir = path.relative(process.cwd(), outputDir);

  const pngPages = await pdfToPng(pdfPath, {
    disableFontFace: false,
    useSystemFonts: false,
    enableXfa: false,
    viewportScale: 2.0,
    outputFolder: relativeOutputDir,   // relative path — library joins with process.cwd()
    outputFileMaskFunc: (pageNum) => `${pdfBaseName}-page-${pageNum}.png`,
    pagesToProcess,
    verbosityLevel: 0,
  });

  if (!pngPages || pngPages.length === 0) {
    throw new Error('PDF conversion produced zero pages. The file may be corrupt or empty.');
  }

  if (pngPages.length === MAX_PAGES) {
    console.warn(`[PDF] PDF may have more than ${MAX_PAGES} pages — only the first ${MAX_PAGES} were processed.`);
  }

  const imagePaths = pngPages.map((p) => p.path);
  console.log(`[PDF] Converted ${imagePaths.length} page(s) from "${path.basename(pdfPath)}"`);
  return imagePaths;
}

/**
 * Reads an image file from disk and returns its base64-encoded string.
 *
 * @param {string} imagePath - Absolute path to the image file
 * @returns {string} - Base64 encoded content
 */
function imageToBase64(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  return buffer.toString('base64');
}

/**
 * Deletes a list of files from disk. Skips silently if a file doesn't exist.
 *
 * @param {string[]} filePaths - Array of absolute file paths to delete
 */
function cleanupTempImages(filePaths) {
  for (const fp of filePaths) {
    try {
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
        console.log(`[PDF] Cleaned up temp file: ${path.basename(fp)}`);
      }
    } catch (err) {
      console.warn(`[PDF] Could not delete temp file ${fp}: ${err.message}`);
    }
  }
}

module.exports = { convertPdfToImages, imageToBase64, cleanupTempImages };
