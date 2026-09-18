import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.financial import (
    InsurancePolicyModel,
    GovernmentSchemeModel,
    NGOSupportModel,
    CareToCostAssessmentModel
)
from app.models.patient import PatientModel
from app.schemas import (
    FinancialAssessmentRequest,
    FinancialAssessmentResponse,
    FinancePlanRequest,
    FinancePlanResponse
)
from app.services.finance_service import FinanceService

router = APIRouter(prefix="/api/financial", tags=["Care-to-Cost Financial Assistance"])

@router.get("/insurance/{patient_id}")
def get_patient_insurance(patient_id: str, db: Session = Depends(get_db)):
    policies = db.query(InsurancePolicyModel).filter(
        (InsurancePolicyModel.patient_id == patient_id) | (InsurancePolicyModel.patient_id == "pat-sharma-1")
    ).all()
    return [
        {
            "id": p.id,
            "patientId": p.patient_id,
            "providerName": p.provider_name,
            "policyNumber": p.policy_number,
            "sumInsured": p.sum_insured,
            "availableBalance": p.available_balance,
            "coPayPercentage": p.co_pay_percentage,
            "isCashlessAvailable": p.is_cashless_available,
            "status": p.status
        }
        for p in policies
    ]

@router.get("/schemes/{patient_id}")
def get_gov_schemes(patient_id: str, db: Session = Depends(get_db)):
    schemes = db.query(GovernmentSchemeModel).all()
    return [
        {
            "id": s.id,
            "schemeCode": s.scheme_code,
            "schemeName": s.scheme_name,
            "description": s.description,
            "maxBenefitAmount": s.max_benefit_amount,
            "eligibilityCriteria": s.eligibility_criteria,
            "requiredDocuments": s.required_documents,
            "contactHelpline": s.contact_helpline
        }
        for s in schemes
    ]

@router.get("/ngo-support/{patient_id}")
def get_ngo_support(patient_id: str, db: Session = Depends(get_db)):
    ngos = db.query(NGOSupportModel).all()
    return [
        {
            "id": n.id,
            "organizationName": n.organization_name,
            "supportType": n.support_type,
            "maxAssistanceAmount": n.max_assistance_amount,
            "eligibilityDescription": n.eligibility_description,
            "requiredDocuments": n.required_documents,
            "applicationStatus": n.application_status
        }
        for n in ngos
    ]

@router.post("/assess", response_model=FinancialAssessmentResponse)
def assess_care_to_cost(payload: FinancialAssessmentRequest, db: Session = Depends(get_db)):
    patient = db.query(PatientModel).filter(
        (PatientModel.id == payload.patient_id) | (PatientModel.user_id == payload.patient_id)
    ).first()

    has_insurance = patient.has_insurance if patient else True
    has_gov = patient.has_government_card if patient else True
    ration_type = patient.ration_card_type if patient else "BPL"

    assessment = FinanceService.calculate_assessment(
        treatment_cost=payload.treatment_cost,
        has_insurance=has_insurance,
        insurance_balance=420000.0,
        has_gov_card=has_gov,
        ration_card_type=ration_type
    )

    # Save assessment record
    ass_id = f"ass-{int(datetime.datetime.utcnow().timestamp()*1000)}"
    db_assessment = CareToCostAssessmentModel(
        id=ass_id,
        patient_id=payload.patient_id,
        hospital_name=payload.hospital_name or "Sassoon General Hospital",
        estimated_treatment_cost=assessment["estimated_treatment_cost"],
        insurance_coverage=assessment["insurance_support"],
        government_support=assessment["government_support"],
        ngo_assistance=assessment["ngo_support"],
        patient_self_contribution=assessment["estimated_patient_gap"],
        financial_gap=assessment["estimated_patient_gap"],
        is_funding_complete=assessment["is_funding_complete"]
    )
    db.add(db_assessment)

    if patient and patient.care_stage < 11:
        patient.care_stage = 11

    db.commit()

    return assessment

@router.post("/finance-plan", response_model=FinancePlanResponse)
def generate_finance_plan(payload: FinancePlanRequest):
    cost = float(payload.treatment_cost)
    ins = float(payload.insurance_coverage)
    gov = float(payload.government_support)
    ngo = float(payload.ngo_support)
    sav = float(payload.additional_savings)

    out_of_pocket = max(0.0, cost - (ins + gov + ngo))
    rem_gap = max(0.0, out_of_pocket - sav)

    if rem_gap <= 0.0:
        tag = "RECOMMENDED: 100% COVERED (ZERO OUT-OF-POCKET GAP)"
    elif rem_gap <= 15000.0:
        tag = "FEASIBLE: LOW GAP COVERED BY NGO & SAVINGS"
    else:
        tag = "FINANCING REQUIRED: HIGH GAP — APPLY FOR CSR GRANT"

    return {
        "estimated_cost": cost,
        "insurance_benefit": ins,
        "government_benefit": gov,
        "ngo_benefit": ngo,
        "patient_out_of_pocket": out_of_pocket,
        "remaining_gap": rem_gap,
        "recommendation_tag": tag,
        "disclaimer": "Indicative affordability plan only. Final figures subject to hospital and provider billing verification."
    }
