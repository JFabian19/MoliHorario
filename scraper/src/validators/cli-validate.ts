import fs from 'fs';
import path from 'path';
import { DataValidator } from './dataValidator';
import { SCRAPER_CONFIG } from '../config';

function runCliValidation() {
  const file = path.join(SCRAPER_CONFIG.outputDir, 'cursos.json');
  console.log(`[VALIDATOR] Validating file: ${file}`);

  if (!fs.existsSync(file)) {
    console.error(`[VALIDATOR ERROR] File does not exist: ${file}`);
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(file, 'utf8');
    const dataset = JSON.parse(raw);
    const report = DataValidator.validate(dataset);

    console.log('\n--- VALIDATION SUMMARY ---');
    console.log(`Status: ${report.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`Total Courses: ${report.stats.courses}`);
    console.log(`Total Sections: ${report.stats.sections}`);
    console.log(`Total Sessions: ${report.stats.sessions}`);
    console.log(`Unique Teachers: ${report.stats.teachers}`);
    console.log(`Warnings: ${report.warnings.length}`);
    console.log(`Errors: ${report.errors.length}`);

    if (report.warnings.length > 0) {
      console.log('\n--- WARNINGS (First 10) ---');
      report.warnings.slice(0, 10).forEach(w => console.warn(` - ${w}`));
    }

    if (report.errors.length > 0) {
      console.log('\n--- ERRORS ---');
      report.errors.forEach(e => console.error(` - ${e}`));
      process.exit(1);
    } else {
      console.log('\n✅ Data validation passed successfully!');
      process.exit(0);
    }
  } catch (err: any) {
    console.error(`[VALIDATOR FATAL ERROR] Failed to parse JSON: ${err.message}`);
    process.exit(1);
  }
}

runCliValidation();
