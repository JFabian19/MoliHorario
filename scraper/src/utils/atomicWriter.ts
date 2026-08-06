import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CursosJsonDataset, MetadataJsonDataset, ScrapeErrorItem } from '../types';
import { SCRAPER_CONFIG } from '../config';
import { ScraperLogger } from './logger';

export class AtomicDataWriter {
  static saveDataset(
    dataset: CursosJsonDataset,
    metadata: MetadataJsonDataset,
    errors: ScrapeErrorItem[]
  ): boolean {
    const { outputDir, backupDir } = SCRAPER_CONFIG;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const cursosFile = path.join(outputDir, 'cursos.json');
    const metadataFile = path.join(outputDir, 'metadata.json');
    const errorsFile = path.join(outputDir, 'scrape-errors.json');
    const tmpFile = path.join(outputDir, 'cursos.json.tmp');
    const backupFile = path.join(backupDir, `cursos_${Date.now()}.json`);

    // 1. Validation check before touching existing file
    if (!dataset.courses || dataset.courses.length === 0) {
      ScraperLogger.error("ABORTING WRITE: Extracted dataset has 0 courses. Preserving existing valid file.");
      return false;
    }

    // 2. Check for drop in records compared to existing valid file
    if (fs.existsSync(cursosFile)) {
      try {
        const oldContent = fs.readFileSync(cursosFile, 'utf8');
        const oldDataset: CursosJsonDataset = JSON.parse(oldContent);
        const oldCourseCount = oldDataset.courses ? oldDataset.courses.length : 0;
        
        if (oldCourseCount > 0) {
          const dropRatio = (oldCourseCount - dataset.courses.length) / oldCourseCount;
          if (dropRatio > 0.3) {
            ScraperLogger.warn(
              `WARNING: Course count dropped significantly from ${oldCourseCount} to ${dataset.courses.length} (${(dropRatio * 100).toFixed(1)}% drop).`
            );
          }
        }

        // Create backup of old valid file
        fs.copyFileSync(cursosFile, backupFile);
        ScraperLogger.info(`Backup of valid cursos.json saved to: ${backupFile}`);
      } catch (err) {
        ScraperLogger.warn("Could not read previous cursos.json for comparison or backup:", err);
      }
    }

    // 3. Write atomic temp file
    try {
      const datasetJsonStr = JSON.stringify(dataset, null, 2);
      fs.writeFileSync(tmpFile, datasetJsonStr, 'utf8');

      // Verify temp file reading
      const verifyData = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
      if (!verifyData.courses || verifyData.courses.length !== dataset.courses.length) {
        throw new Error("Temporary file verification failed!");
      }

      // Rename atomic swap
      fs.renameSync(tmpFile, cursosFile);

      // Write metadata & errors
      metadata.checksum = crypto.createHash('sha256').update(datasetJsonStr).digest('hex');
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf8');
      fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2), 'utf8');

      ScraperLogger.info("Atomic write successful! Updated cursos.json and metadata.json.");
      return true;
    } catch (error) {
      ScraperLogger.error("Failed during atomic write:", error);
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
      return false;
    }
  }
}
