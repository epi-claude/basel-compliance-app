import { PDFService } from '../services/pdfService';
import fs from 'fs';
import path from 'path';

async function generateSamplePDF() {
  try {
    console.log('📄 Loading test data...');
    const testDataPath = path.join(__dirname, '../test-data/basel-test-data.json');
    const testDataRaw = fs.readFileSync(testDataPath, 'utf-8');
    const testData = JSON.parse(testDataRaw);

    console.log(`\n📋 Test Scenario: ${testData.scenario}`);
    console.log(`📋 Description: ${testData.description}\n`);

    console.log('🔧 Generating PDF with test data...');
    const pdfBuffer = await PDFService.fillBaselNotificationPDF(testData.data);

    // Save to output directory
    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'sample-basel-notification.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`\n✅ Sample PDF generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`📏 Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n👀 Please review this PDF to identify readability issues.`);

  } catch (error) {
    console.error('❌ Error generating sample PDF:', error);
    process.exit(1);
  }
}

generateSamplePDF();
