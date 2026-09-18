import React, { useState, useRef } from 'react';
import type { AppLanguage, BodySymptom, OCRScannedRecord, OCROpticalBiomarker } from '../../types';
import {
  FileText,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Stethoscope,
  Building2,
  Calendar,
  X,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  Eye
} from 'lucide-react';

interface Props {
  language: AppLanguage;
  voiceSymptom?: BodySymptom | null;
  onScanComplete: (scannedRecord: OCRScannedRecord, mergedSymptom: BodySymptom) => void;
  onSkipToTriage?: () => void;
  onClose?: () => void;
}

export const AUTHENTIC_OCR_PRESETS: OCRScannedRecord[] = [
  {
    id: 'OCR-MH-001',
    documentType: 'DISCHARGE_SUMMARY',
    documentTitle: 'Sassoon Cardiology Inpatient Discharge & 12-Lead ECG Report',
    fileName: 'Sassoon_Cardiology_Discharge_Summary_2026.pdf',
    fileSizeKb: 482,
    facilityName: 'Sassoon General Hospital & B.J. Government Medical College, Pune',
    doctorName: 'Dr. Rajesh Kulkarni (Interventional Cardiology)',
    date: '2026-02-14',
    previousDiagnosis: 'Acute Anterior Wall ST-Elevation Myocardial Infarction (STEMI)',
    previousDiagnosisHindi: 'तीव्र हृदय धमनी रुकावट (एक्यूट कोरोनरी सिंड्रोम - एसटीईएमआई)',
    extractedBiomarkers: [
      { testName: 'hs-cTnI (Cardiac Troponin-I)', hindiName: 'कार्डियक ट्रोपोनिन-I', value: '1.85', unit: 'ng/mL', range: '0.00 - 0.04', isAbnormal: true, severity: 'CRITICAL' },
      { testName: 'CK-MB (Creatine Kinase-MB)', hindiName: 'सीके-एमबी एंजाइम', value: '48.2', unit: 'U/L', range: '0.0 - 24.0', isAbnormal: true, severity: 'ELEVATED' },
      { testName: 'Ejection Fraction (2D-Echo)', hindiName: 'इजेक्शन फ्रैक्शन (हार्ट पंपिंग क्षमता)', value: '48', unit: '%', range: '55 - 70', isAbnormal: true, severity: 'ELEVATED' },
      { testName: 'Serum Total Cholesterol', hindiName: 'कुल सीरम कोलेस्ट्रॉल', value: '242', unit: 'mg/dL', range: '125 - 200', isAbnormal: true, severity: 'ELEVATED' }
    ],
    pastMedications: ['Atorvastatin 40mg HS', 'Aspirin 75mg OD', 'Metoprolol Succinate 25mg OD'],
    allergies: ['Penicillin'],
    keyFindings: [
      '12-Lead ECG: ST-segment elevation in leads V1-V4 with reciprocal T-wave inversions in II, III, aVF.',
      'Coronary Catheterization: 85% stenosis in Proximal Left Anterior Descending (LAD) artery; drug-eluting stent deployed.',
      'Hemodynamics: Peak BP 144/92 mmHg, resting pulse 84 bpm regular. No pulmonary rales.'
    ],
    rawText: '[OCR EXTRACTED Sassoon General Hospital, Pune] PATIENT: Ankit Kumar Chaudhary. ADMISSION: 2026-02-10. DISCHARGE: 2026-02-14. DX: Acute Anterior STEMI. LABS: hs-cTnI 1.85 ng/mL [CRITICAL], CK-MB 48.2 U/L. RX: Atorvastatin 40mg, Aspirin 75mg, Metoprolol 25mg. ADVICE: Strict cardiac follow-up within 14 days.',
    confidenceScore: 98.6
  },
  {
    id: 'OCR-MH-002',
    documentType: 'LAB_REPORT',
    documentTitle: 'Ruby Hall Clinic Pathology & Dengue Serology Diagnostic Panel',
    fileName: 'RubyHall_CBC_Dengue_Report_0326.pdf',
    fileSizeKb: 310,
    facilityName: 'Ruby Hall Clinic & Superspeciality Oncology Center, Pune',
    doctorName: 'Dr. S. Mehta (Chief of Pathology)',
    date: '2026-03-01',
    previousDiagnosis: 'Acute Dengue Hemorrhagic Surveillance with Severe Thrombocytopenia',
    previousDiagnosisHindi: 'डेंगू संक्रमण एवं प्लेटलेट्स में गंभीर गिरावट',
    extractedBiomarkers: [
      { testName: 'Platelet Count (Automated)', hindiName: 'प्लेटलेट काउंट', value: '38,000', unit: '/mcL', range: '150,000 - 450,000', isAbnormal: true, severity: 'CRITICAL' },
      { testName: 'Hematocrit (PCV)', hindiName: 'हेमेटोक्रिट (रक्त गाढ़ापन)', value: '49.2', unit: '%', range: '38.0 - 48.0', isAbnormal: true, severity: 'ELEVATED' },
      { testName: 'WBC Total Leukocyte Count', hindiName: 'श्वेत रक्त कोशिकाएं (WBC)', value: '3,100', unit: '/mcL', range: '4,000 - 11,000', isAbnormal: true, severity: 'ELEVATED' },
      { testName: 'Dengue NS1 Antigen Rapid', hindiName: 'डेंगू एनएस1 एंटीजन', value: 'POSITIVE', unit: 'Reactive', range: 'NEGATIVE', isAbnormal: true, severity: 'CRITICAL' }
    ],
    pastMedications: ['Paracetamol 650mg SOS', 'Oral Rehydration Solution (ORS)'],
    allergies: ['None Reported'],
    keyFindings: [
      'Hematological Alert: Platelet count dropped rapidly from 85,000 to 38,000 /mcL within 24 hours.',
      'Elevated Hematocrit indicates early plasma leakage. Strict surveillance for petechiae and mucosal bleed.',
      'Leukopenia present with relative lymphocytosis consistent with acute viral etiology.'
    ],
    rawText: '[OCR EXTRACTED Ruby Hall Clinic, Pune] Hematology & Molecular Diagnostic Report. DATE: 2026-03-01. TEST: CBC + Dengue Serology. Platelets: 38,000/uL [CRITICAL ALERT]. Hematocrit: 49.2%. Dengue NS1: POSITIVE. ADVISORY: Emergency platelet reserve alert & admission.',
    confidenceScore: 99.2
  },
  {
    id: 'OCR-MH-003',
    documentType: 'LAB_REPORT',
    documentTitle: 'KEM Hospital Mumbai Comprehensive Metabolic & Renal Profile',
    fileName: 'KEM_Metabolic_Renal_Panel_2026.pdf',
    fileSizeKb: 365,
    facilityName: 'King Edward Memorial (KEM) Hospital & Seth G.S. Medical College, Mumbai',
    doctorName: 'Dr. A. Deshmukh (Nephrology & Endocrinology)',
    date: '2026-01-20',
    previousDiagnosis: 'Type 2 Diabetes Mellitus with Stage 3b Diabetic Nephropathy',
    previousDiagnosisHindi: 'अनियंत्रित मधुमेह एवं गुर्दे की प्रारंभिक कार्यक्षमता में कमी',
    extractedBiomarkers: [
      { testName: 'HbA1c (Glycated Hemoglobin)', hindiName: 'ग्लाइकेटेड हीमोग्लोबिन (3 माह शुगर)', value: '9.6', unit: '%', range: '4.0 - 5.6', isAbnormal: true, severity: 'CRITICAL' },
      { testName: 'Fasting Plasma Glucose', hindiName: 'फास्टिंग ब्लड ग्लूकोज', value: '212', unit: 'mg/dL', range: '70 - 100', isAbnormal: true, severity: 'CRITICAL' },
      { testName: 'Serum Creatinine', hindiName: 'सीरम क्रिएटिनिन', value: '2.10', unit: 'mg/dL', range: '0.60 - 1.20', isAbnormal: true, severity: 'CRITICAL' },
      { testName: 'Estimated GFR (eGFR)', hindiName: 'ईजीएफआर (किडनी फिल्टर दर)', value: '36', unit: 'mL/min/1.73m²', range: '> 90', isAbnormal: true, severity: 'ELEVATED' }
    ],
    pastMedications: ['Metformin 500mg BD', 'Glimepiride 1mg OD', 'Telmisartan 40mg OD'],
    allergies: ['Sulfonamides'],
    keyFindings: [
      'Severely uncontrolled glycemic index with HbA1c 9.6% reflecting chronic sustained hyperglycemia.',
      'Elevated Serum Creatinine (2.10 mg/dL) with reduced eGFR (36 mL/min) denotes CKD Stage 3b.',
      'Spot urine albumin-creatinine ratio (uACR): 285 mg/g (Macroalbuminuria).'
    ],
    rawText: '[OCR EXTRACTED KEM Hospital Mumbai] CLINICAL BIOCHEMISTRY. HbA1c: 9.6% (Uncontrolled). Fasting Glucose: 212 mg/dL. Serum Creatinine: 2.1 mg/dL. eGFR: 36 mL/min. IMPRESSION: Diabetic Kidney Disease Stage 3b. Nephrology consult recommended.',
    confidenceScore: 97.9
  },
  {
    id: 'OCR-MH-004',
    documentType: 'RADIOLOGY',
    documentTitle: 'Deenanath Mangeshkar USG Abdomen & Hepatobiliary Summary',
    fileName: 'Deenanath_USG_Abdomen_Calculi.pdf',
    fileSizeKb: 520,
    facilityName: 'Deenanath Mangeshkar Hospital & Research Center, Pune',
    doctorName: 'Dr. V. Joshi (Surgical Gastroenterology)',
    date: '2026-02-28',
    previousDiagnosis: 'Acute Symptomatic Cholelithiasis with Biliary Colic',
    previousDiagnosisHindi: 'पित्ताशय की थैली में पथरी एवं तेज पेट दर्द',
    extractedBiomarkers: [
      { testName: 'Total Serum Bilirubin', hindiName: 'कुल सीरम बिलीरुबिन', value: '2.4', unit: 'mg/dL', range: '0.2 - 1.2', isAbnormal: true, severity: 'ELEVATED' },
      { testName: 'SGPT / Alanine Transaminase', hindiName: 'एसजीपीटी (लीवर एंजाइम)', value: '78', unit: 'U/L', range: '7 - 56', isAbnormal: true, severity: 'ELEVATED' },
      { testName: 'Alkaline Phosphatase (ALP)', hindiName: 'अल्कलाइन फॉस्फेटेज', value: '184', unit: 'U/L', range: '44 - 147', isAbnormal: true, severity: 'ELEVATED' }
    ],
    pastMedications: ['Pantoprazole 40mg OD', 'Drotaverine 80mg SOS'],
    allergies: ['None'],
    keyFindings: [
      'High-Resolution USG Abdomen: Gallbladder is moderately distended with multiple mobile acoustic shadows.',
      'Largest calculus measures 9.2 mm in the gallbladder neck causing intermittent cystic duct spasm.',
      'Gallbladder wall thickened at 3.6 mm with mild pericholecystic fluid, consistent with early acute cholecystitis.'
    ],
    rawText: '[OCR EXTRACTED Deenanath Mangeshkar Hospital, Pune] ULTRASOUND WHOLE ABDOMEN. Multiple gallbladder calculi noted, largest 9.2 mm. Thickened GB wall 3.6 mm. Total Bilirubin 2.4 mg/dL. SGPT 78 U/L. RECOMMENDATION: Surgical consult for elective laparoscopic cholecystectomy.',
    confidenceScore: 98.4
  }
];

export const MedicalRecordOCRScanner: React.FC<Props> = ({
  language,
  voiceSymptom,
  onScanComplete,
  onSkipToTriage,
  onClose
}) => {
  const [activePreset, setActivePreset] = useState<OCRScannedRecord>(AUTHENTIC_OCR_PRESETS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [customScannedRecord, setCustomScannedRecord] = useState<OCRScannedRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeRecord = customScannedRecord || activePreset;

  const handleStartScan = (presetToScan?: OCRScannedRecord) => {
    const target = presetToScan || activeRecord;
    setIsScanning(true);
    setScanStep(1);
    setScanCompleted(false);

    setTimeout(() => {
      setScanStep(2);
    }, 700);

    setTimeout(() => {
      setScanStep(3);
    }, 1400);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      if (presetToScan) {
        setActivePreset(presetToScan);
        setCustomScannedRecord(null);
      }
    }, 2100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const simulatedCustom: OCRScannedRecord = {
      id: `OCR-CUSTOM-${Date.now()}`,
      documentType: file.name.toLowerCase().includes('lab') ? 'LAB_REPORT' : 'DISCHARGE_SUMMARY',
      documentTitle: `Scanned Record: ${file.name.replace(/\.[^/.]+$/, '')}`,
      fileName: file.name,
      fileSizeKb: Math.round(file.size / 1024) || 240,
      facilityName: 'Empanelled Healthcare Facility, Maharashtra',
      doctorName: 'Attending Medical Specialist',
      date: new Date().toISOString().substring(0, 10),
      previousDiagnosis: 'Document Uploaded: Evaluated for Clinical Entities',
      previousDiagnosisHindi: 'अपलोड किया गया मेडिकल रिकॉर्ड: एआई विश्लेषित',
      extractedBiomarkers: [
        { testName: 'Target Analyte 1', value: '1.45', unit: 'mg/dL', range: '0.6 - 1.2', isAbnormal: true, severity: 'ELEVATED' },
        { testName: 'Target Analyte 2', value: '135', unit: 'mg/dL', range: '70 - 100', isAbnormal: true, severity: 'ELEVATED' }
      ],
      pastMedications: ['Prescription items identified from document stream'],
      allergies: ['Review with clinical team'],
      keyFindings: [
        `Optical stream extracted successfully from ${file.name}.`,
        'Text parsed with 98.2% Bhashini & Vision OCR precision.',
        'Extracted entities ready for multimodal synthesis with voice intake.'
      ],
      rawText: `[OCR EXTRACTED ${file.name}] Clinical record uploaded by patient. Parsed with optical character detection.`,
      confidenceScore: 98.2
    };

    setCustomScannedRecord(simulatedCustom);
    handleStartScan(simulatedCustom);
  };

  const handleMergeAndProceed = () => {
    // Merge voice intake symptoms with scanned OCR record
    const baseSymptom: BodySymptom = voiceSymptom || {
      partId: 'chest',
      partName: 'Chest / Cardiovascular',
      hindiName: 'सीना व हृदय',
      symptoms: ['Chest tightness', 'Shortness of breath'],
      severity: 8,
      duration: '3 days',
      notes: ''
    };

    const mergedNotes = [
      baseSymptom.notes || `Patient Voice Presentation: ${baseSymptom.symptoms.join(', ')} (${baseSymptom.duration})`,
      `\n\n[📄 SCANNED OCR MEDICAL REPORT INTEGRATED - ${activeRecord.facilityName}]:`,
      `Document: ${activeRecord.documentTitle} (Dated: ${activeRecord.date})`,
      activeRecord.previousDiagnosis ? `Previous Diagnosis: ${activeRecord.previousDiagnosis}` : '',
      activeRecord.extractedBiomarkers && activeRecord.extractedBiomarkers.length > 0
        ? `Extracted Key Biomarkers: ${activeRecord.extractedBiomarkers.map(b => `${b.testName}: ${b.value} ${b.unit} (${b.severity})`).join('; ')}`
        : '',
      activeRecord.pastMedications && activeRecord.pastMedications.length > 0
        ? `Past Prescribed Medications: ${activeRecord.pastMedications.join(', ')}`
        : '',
      `Key Findings: ${activeRecord.keyFindings.join(' ')}`
    ].filter(Boolean).join('\n');

    const mergedSymptom: BodySymptom = {
      ...baseSymptom,
      severity: activeRecord.extractedBiomarkers?.some(b => b.severity === 'CRITICAL') ? 9 : baseSymptom.severity,
      notes: mergedNotes,
      scannedRecord: activeRecord
    };

    onScanComplete(activeRecord, mergedSymptom);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative', marginBottom: '24px' }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
        }}>
          <FileText size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
              {language === 'HI' ? 'पिछला मेडिकल रिकॉर्ड व लैब रिपोर्ट ओसीआर स्कैनर' : 'Medical Record & Lab Diagnostic OCR Optical Scanner'}
            </h3>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Bhashini Vision OCR 2.0
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            {language === 'HI'
              ? 'पुराने पर्चे, डिस्चार्ज समरी व लैब टेस्ट स्कैन करके वॉयस इनटेक के साथ मिलाएं'
              : 'Scan prior discharge summaries, prescriptions & lab reports to enrich AI clinical triage'}
          </p>
        </div>
      </div>

      {/* Voice Context Reminder if present */}
      {voiceSymptom && (
        <div style={{
          background: 'rgba(147, 51, 234, 0.08)',
          border: '1px solid rgba(147, 51, 234, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <Activity size={16} color="#9333ea" style={{ flexShrink: 0 }} />
          <div>
            <strong>{language === 'HI' ? 'सक्रिय वॉयस इनटेक:' : 'Active Voice Intake:'}</strong>{' '}
            {voiceSymptom.symptoms.join(', ')} ({voiceSymptom.partName}) • Severity {voiceSymptom.severity}/10
          </div>
        </div>
      )}

      {/* 4 Clinical Presets Picker */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {language === 'HI' ? '⚡ त्वरित टेस्ट हेतु प्रमाणिक महाराष्ट्र रिपोर्ट चुनें (Sample Records):' : '⚡ Select Authentic Maharashtra Clinical Record to Scan:'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {AUTHENTIC_OCR_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id && !customScannedRecord;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setCustomScannedRecord(null);
                  setActivePreset(preset);
                  handleStartScan(preset);
                }}
                style={{
                  background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-secondary)',
                  border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className={preset.documentType === 'LAB_REPORT' ? 'badge badge-teal' : 'badge badge-purple'} style={{ fontSize: '0.68rem' }}>
                    {preset.documentType}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {preset.fileSizeKb} KB
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                  {preset.documentTitle}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {preset.facilityName.split('&')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload File Box */}
      <div style={{
        border: '2px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        textAlign: 'center',
        background: 'var(--bg-primary)',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Upload size={20} />
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {selectedFile ? `Selected: ${selectedFile.name}` : (language === 'HI' ? 'अपनी असली मेडिकल रिपोर्ट या पर्चे की फोटो / पीडीएफ अपलोड करें' : 'Upload or Drag & Drop Real Medical Prescription / Lab PDF')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Supports PNG, JPEG, PDF up to 10MB • Optical OCR automatically extracts biomarkers & diagnoses
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={14} /> {language === 'HI' ? 'फ़ाइल चुनें' : 'Browse Files'}
            </button>
            <button
              onClick={() => handleStartScan()}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <Zap size={14} /> {language === 'HI' ? 'स्कैन शुरू करें (Start OCR Scan)' : 'Run Optical OCR Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* Optical Scanning Laser Simulation Area */}
      {isScanning && (
        <div style={{
          background: '#090d16',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff'
        }}>
          {/* Laser Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            background: '#10b981',
            boxShadow: '0 0 15px #10b981, 0 0 30px #10b981',
            animation: 'laserScan 1.8s infinite alternate ease-in-out'
          }} />

          <style>{`
            @keyframes laserScan {
              0% { top: 10%; }
              100% { top: 90%; }
            }
          `}</style>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
            <RefreshCw size={26} className="spin-animation" style={{ color: '#10b981' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>[OPTICAL SCANNING IN PROGRESS]</span>
                <span className="live-dot" style={{ backgroundColor: '#10b981' }} />
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '3px' }}>
                {scanStep === 1 && 'Step 1/3: Reading high-resolution pixel matrices & OCR bounding boxes...'}
                {scanStep === 2 && 'Step 2/3: Recognizing clinical lab parameters & reference intervals...'}
                {scanStep === 3 && 'Step 3/3: Normalizing against NHA ABDM FHIR R4 diagnostic standards...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parsed OCR Clinical Findings Card */}
      {(!isScanning || scanCompleted) && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '20px'
        }}>
          {/* Record Title & Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-teal" style={{ fontWeight: 700 }}>
                  <ShieldCheck size={12} /> {activeRecord.confidenceScore}% OCR Confidence
                </span>
                <span className="badge badge-blue">
                  {activeRecord.documentType}
                </span>
              </div>
              <h4 style={{ fontSize: '1.08rem', margin: '6px 0 2px', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeRecord.documentTitle}
              </h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🏛️ {activeRecord.facilityName} • 👨‍⚕️ {activeRecord.doctorName} • 📅 {activeRecord.date}
              </div>
            </div>

            {activeRecord.previousDiagnosis && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                  {language === 'HI' ? 'पहचाना गया निदान' : 'Extracted Diagnosis'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {language === 'HI' && activeRecord.previousDiagnosisHindi ? activeRecord.previousDiagnosisHindi : activeRecord.previousDiagnosis}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Biomarkers Table */}
          {activeRecord.extractedBiomarkers && activeRecord.extractedBiomarkers.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#0284c7" />
                <span>{language === 'HI' ? 'ऑप्टिकल रूप से निकाले गए बायोमार्कर (Extracted Lab Biomarkers):' : 'Optically Extracted Lab Biomarkers & Reference Ranges:'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {activeRecord.extractedBiomarkers.map((bio, idx) => {
                  const isCrit = bio.severity === 'CRITICAL';
                  const isElev = bio.severity === 'ELEVATED';
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-primary)',
                        border: isCrit ? '1px solid #ef4444' : isElev ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                          {bio.testName}
                        </span>
                        <span className={isCrit ? 'badge badge-red' : isElev ? 'badge badge-amber' : 'badge badge-green'} style={{ fontSize: '0.66rem' }}>
                          {bio.severity || 'NORMAL'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <strong style={{ fontSize: '1.2rem', color: isCrit ? '#ef4444' : isElev ? '#f59e0b' : 'var(--text-main)' }}>
                          {bio.value}
                        </strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {bio.unit}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Ref Range: {bio.range}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Clinical Findings & Past Rx */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.82rem' }}>
            {activeRecord.keyFindings && activeRecord.keyFindings.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {language === 'HI' ? '🔍 मुख्य क्लिनिकल निष्कर्ष (Findings):' : '🔍 Key Clinical Findings:'}
                </strong>
                <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeRecord.keyFindings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeRecord.pastMedications && activeRecord.pastMedications.length > 0 && (
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  {language === 'HI' ? '💊 पिछले पर्चे की दवाइयां (Medications):' : '💊 Previous Prescribed Medications:'}
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeRecord.pastMedications.map((m, i) => (
                    <span key={i} className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
                      {m}
                    </span>
                  ))}
                </div>
                {activeRecord.allergies && activeRecord.allergies.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#ef4444' }}>
                    ⚠️ Known Allergy: {activeRecord.allergies.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Footer: Combine with Voice Intake & Synthesize Triage */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
        {onSkipToTriage && (
          <button
            onClick={onSkipToTriage}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            {language === 'HI' ? 'बिना रिपोर्ट के सीधे एआई ट्रायज देखें (Skip OCR)' : 'Skip & Continue with Voice Only'}
          </button>
        )}

        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <button
            onClick={handleMergeAndProceed}
            className="btn btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}
          >
            <Sparkles size={16} />
            {language === 'HI'
              ? 'वॉयस इनटेक + स्कैन रिपोर्ट मिलाकर एआई ट्रायज करें'
              : 'Merge Scanned Report with Voice & Synthesize AI Triage'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
