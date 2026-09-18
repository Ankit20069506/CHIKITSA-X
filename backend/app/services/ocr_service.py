import datetime
from typing import Dict, Any

class OCRService:
    """
    Development OCR Service Adapter for Phase 1D.
    Interface designed for seamless drop-in replacement with cloud OCR providers
    (e.g., Google Cloud Vision, AWS Textract, Tesseract OCR) in future phases.
    """
    @staticmethod
    def extract_text(file_content: bytes, file_name: str, category: str = "General") -> str:
        size_kb = round(len(file_content) / 1024, 1)
        return f"[Development OCR Adapter] Extracted text stream from {file_name} ({size_kb} KB, Category: {category})"

    @staticmethod
    def extract_medical_fields(raw_text: str, category: str, file_name: str = "") -> Dict[str, Any]:
        category_lower = category.lower()
        file_name_lower = file_name.lower()

        if "prescription" in category_lower or "rx" in file_name_lower:
            return {
                "previousCondition": "Extracted Clinical Prescription",
                "medicinesExtracted": ["Atorvastatin 20mg OD", "Telmisartan 40mg OD", "Metformin 500mg BD"],
                "allergiesExtracted": ["Penicillin"],
                "diagnosisExtracted": "Cardiovascular Risk Evaluation & Hypertension Control",
                "doctorName": "Dr. Rajesh Kulkarni",
                "hospitalName": "Sassoon General Hospital & B.J. Medical College",
                "ocrAdapterStatus": "development_mock_adapter"
            }
        elif "lab" in category_lower or "report" in category_lower or "blood" in file_name_lower:
            return {
                "previousCondition": "Extracted Laboratory Panel",
                "labResults": [
                    {"testName": "HbA1c (Glycated Hemoglobin)", "value": "7.2", "unit": "%", "range": "4.0 - 5.6"},
                    {"testName": "Fasting Blood Glucose", "value": "138", "unit": "mg/dL", "range": "70 - 100"},
                    {"testName": "Serum Creatinine", "value": "0.92", "unit": "mg/dL", "range": "0.6 - 1.2"}
                ],
                "medicinesExtracted": ["Metformin 500mg BD"],
                "diagnosisExtracted": "Glycemic & Renal Function Monitoring Report",
                "doctorName": "Dr. Ananya Roy",
                "hospitalName": "Sassoon Diagnostic & Pathology Center, Pune",
                "ocrAdapterStatus": "development_mock_adapter"
            }
        else:
            return {
                "previousCondition": f"Extracted Medical Record ({category})",
                "medicinesExtracted": ["Prescribed Therapy from " + (file_name or "Uploaded Document")],
                "allergiesExtracted": ["Penicillin"],
                "diagnosisExtracted": "Clinical Summary extracted from uploaded file",
                "hospitalName": "Empaneled Care Facility",
                "ocrAdapterStatus": "development_mock_adapter"
            }
