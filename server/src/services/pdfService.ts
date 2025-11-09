import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox } from 'pdf-lib';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export class PDFService {
  private static templatePath = path.join(__dirname, '../pdf-templates/basel_notifiy_app_form - fields - v1 - application.pdf');

  /**
   * Fill the Basel notification PDF with data from the database
   */
  static async fillBaselNotificationPDF(notificationData: any): Promise<Buffer> {
    console.log('📄 Loading PDF template...');

    // Load the PDF template
    const templateBytes = fs.readFileSync(this.templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    console.log('📝 Filling PDF fields...');

    // Get all form fields for debugging
    const fields = form.getFields();
    console.log(`Found ${fields.length} form fields in PDF`);

    // Map our database fields to PDF fields and fill them
    const filledFields = this.fillFormFields(form, notificationData);

    console.log(`✅ Filled ${filledFields} fields`);

    // Flatten the form to make it non-editable (optional)
    // form.flatten();

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Fill form fields based on notification data
   * PDF field names match database field names directly
   */
  private static fillFormFields(form: PDFForm, data: any): number {
    let filledCount = 0;

    // Get all PDF field names
    const pdfFields = form.getFields().map(f => f.getName());
    const pdfFieldSet = new Set(pdfFields);

    // Iterate through all database fields and fill matching PDF fields
    Object.keys(data).forEach(fieldName => {
      // Skip metadata fields
      if (['id', 'submission_package_id', 'status', 'progress_percentage', 'created_by_user_id', 'created_at', 'updated_at'].includes(fieldName)) {
        return;
      }

      const value = data[fieldName];

      // Skip null/undefined values
      if (value === null || value === undefined) {
        return;
      }

      // Check if this field exists in the PDF
      if (pdfFieldSet.has(fieldName)) {
        // Try to fill as text field first
        if (this.fillTextField(form, fieldName, value)) {
          filledCount++;
        }
        // If that fails, try as checkbox
        else if (this.fillCheckBox(form, fieldName, value)) {
          filledCount++;
        }
      }
    });

    // Special handling for date fields that need to be combined
    const firstDeparture = this.formatDate(
      data['6_intended_period_first_departure_month'],
      data['6_intended_period_first_departure_day'],
      data['6_intended_period_first_departure_year']
    );
    if (firstDeparture && this.fillTextField(form, '6_intended_period_first_departure', firstDeparture)) {
      filledCount++;
    }

    const lastDeparture = this.formatDate(
      data['6_intended_period_last_departure_month'],
      data['6_intended_period_last_departure_day'],
      data['6_intended_period_last_departure_year']
    );
    if (lastDeparture && this.fillTextField(form, '6_intended_period_last_departure', lastDeparture)) {
      filledCount++;
    }

    // Special handling for declaration date
    const declarationDate = this.formatDate(
      data['17_exporter_declaration_date_month'],
      data['17_exporter_declaration_date_day'],
      data['17_exporter_declaration_date_year']
    );
    if (declarationDate && this.fillTextField(form, '17_exporter_declaration_date', declarationDate)) {
      filledCount++;
    }

    return filledCount;
  }

  /**
   * Helper to fill a text field
   */
  private static fillTextField(form: PDFForm, fieldName: string, value: any): boolean {
    if (!fieldName || value === null || value === undefined || value === '') return false;

    try {
      const field = form.getTextField(fieldName);
      field.setText(String(value));
      console.log(`  ✓ Filled text field: ${fieldName} = ${String(value).substring(0, 50)}`);
      return true;
    } catch (error) {
      // Field doesn't exist or is not a text field - not an error, just try checkbox
      return false;
    }
  }

  /**
   * Helper to fill a checkbox
   */
  private static fillCheckBox(form: PDFForm, fieldName: string, value: any): boolean {
    if (!fieldName || value === null || value === undefined) return false;

    try {
      const field = form.getCheckBox(fieldName);
      if (value === 1 || value === true || value === 'true') {
        field.check();
        console.log(`  ✓ Checked checkbox: ${fieldName}`);
      } else {
        field.uncheck();
      }
      return true;
    } catch (error) {
      // Field doesn't exist or is not a checkbox - not an error
      return false;
    }
  }

  /**
   * Format date from separate month/day/year fields
   */
  private static formatDate(month?: string, day?: string, year?: string): string {
    if (!month && !day && !year) return '';
    return `${month || ''}/${day || ''}/${year || ''}`.replace(/^\/|\/$/g, '');
  }

  /**
   * Generate a custom readable PDF using the hybrid layout
   */
  static async generateCustomPDF(notificationData: any): Promise<Buffer> {
    console.log('📄 Generating custom PDF with hybrid layout...');

    const html = this.generateHybridHTML(notificationData);

    // Configure Puppeteer for production (Railway/Docker) vs local
    const isProduction = process.env.NODE_ENV === 'production';
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      // Use system Chrome in production (installed via nixpacks.toml)
      executablePath: isProduction ? '/usr/bin/chromium' : undefined
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });

      console.log('✅ Custom PDF generated successfully');
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate HTML for the hybrid layout
   */
  private static generateHybridHTML(data: any): string {
    const { generateCustomPdfHtml } = require('../templates/customPdfTemplate');
    return generateCustomPdfHtml(data);
  }
}
