# Basel PDF Field Calibration (Zero-Deviation)

1) Open the official Basel PDF (static original) in your editor and overlay **AcroForm** fields only (no layout edits).  
2) Use **mm** units, rulers, and snap-to-grid; place each field exactly centered over its printed area.  
3) Field style: Border=None, Font=Helvetica 10pt, Multiline where applicable, Checkbox export value="Yes".  
4) Naming: `BlockN_<Label>` for N=1..18. E.g. `Block1_ExporterName`, `Block3_IndividualShipment`, `Block14_AnnexVIII`.  
5) Save as `fillable_basel.pdf` and test in Chrome/Firefox/Edge + Acrobat.  
6) Run a "calibration fill": enter long strings, various numerics, and checkboxes via the tester page.  
7) If any clipping/misalignment: nudge X/Y by ≤0.5 mm and re-export.  
8) Freeze names once aligned. Share the final field list if you want a locked mapping file from me.
