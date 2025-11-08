import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function inspectPDF() {
  const templatePath = path.join(__dirname, '../pdf-templates/basel_notifiy_app_form - fields - v1 - application.pdf');

  console.log('📄 Loading PDF template...');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  const fields = form.getFields();
  console.log(`\n✅ Found ${fields.length} form fields in PDF:\n`);

  fields.forEach((field, index) => {
    const name = field.getName();
    const type = field.constructor.name;
    console.log(`${index + 1}. ${name} (${type})`);
  });
}

inspectPDF().catch(console.error);
