from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from datetime import datetime
from typing import Dict, Any
import os
from pathlib import Path


# Color palette
NAVY = HexColor('#102A43')
BLUE = HexColor('#2563EB')
TEAL = HexColor('#0D9488')
LIGHT_GRAY = HexColor('#F3F4F6')
MEDIUM_GRAY = HexColor('#E5E7EB')
DARK_GRAY = HexColor('#374151')
RED = HexColor('#DC2626')
AMBER = HexColor('#D97706')
GREEN = HexColor('#16A34A')


def get_risk_color(probability: float) -> HexColor:
    """Get color based on risk probability"""
    if probability >= 0.7:
        return RED
    elif probability >= 0.4:
        return AMBER
    return GREEN


def get_risk_label(probability: float) -> str:
    """Get risk label based on probability"""
    if probability >= 0.7:
        return "High Risk"
    elif probability >= 0.4:
        return "Moderate Risk"
    return "Low Risk"


def generate_pdf_report(analysis) -> str:
    """Generate PDF report for an analysis"""
    
    # Create reports directory
    reports_dir = Path("reports")
    reports_dir.mkdir(exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    patient_id = analysis.patient.patient_id if analysis.patient else "unknown"
    filename = f"GENEVA_Report_{patient_id}_{timestamp}.pdf"
    filepath = reports_dir / filename
    
    # Create document
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=NAVY,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=HexColor('#64748B'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=NAVY,
        spaceBefore=16,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        borderWidth=0,
        borderPadding=0,
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubheading',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=BLUE,
        spaceBefore=10,
        spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=DARK_GRAY,
        spaceAfter=4,
        leading=14,
        fontName='Helvetica'
    )
    
    small_style = ParagraphStyle(
        'CustomSmall',
        parent=styles['Normal'],
        fontSize=8,
        textColor=HexColor('#9CA3AF'),
        spaceAfter=2,
        leading=10,
        fontName='Helvetica'
    )
    
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=RED,
        spaceBefore=12,
        spaceAfter=4,
        leading=12,
        alignment=TA_CENTER,
        fontName='Helvetica-BoldOblique',
        borderWidth=1,
        borderColor=RED,
        borderPadding=8,
        backColor=HexColor('#FEF2F2')
    )
    
    # Build story
    story = []
    
    # Header
    story.append(Paragraph("GENEVA", title_style))
    story.append(Paragraph("AI Cardiovascular Risk Visualization & Prediction System", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=20))
    
    # Report Info
    report_info = [
        ["Report ID:", f"GENEVA-{analysis.id:06d}"],
        ["Date Generated:", datetime.now().strftime("%B %d, %Y at %I:%M %p")],
        ["Patient ID:", patient_id],
        ["Model Version:", analysis.model_version],
        ["Analysis Date:", analysis.created_at.strftime("%B %d, %Y") if analysis.created_at else "N/A"],
    ]
    
    info_table = Table(report_info, colWidths=[50*mm, 110*mm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, MEDIUM_GRAY),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Disclaimer
    story.append(Paragraph(
        "⚠️ DISCLAIMER: For research and educational use only. "
        "Not a substitute for professional medical diagnosis. "
        "This report presents AI-generated predictions based on the Z-Alizadeh Sani dataset "
        "and has not been clinically validated.",
        disclaimer_style
    ))
    story.append(Spacer(1, 16))
    
    # Predictions Overview
    story.append(Paragraph("PREDICTION RESULTS", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BLUE, spaceAfter=12))
    
    predictions = [
        ("Overall CAD Risk", analysis.cad_probability, analysis.cad_prediction),
        ("LAD (Left Anterior Descending)", analysis.lad_probability, analysis.lad_prediction),
        ("LCX (Left Circumflex)", analysis.lcx_probability, analysis.lcx_prediction),
        ("RCA (Right Coronary Artery)", analysis.rca_probability, analysis.rca_prediction),
    ]
    
    pred_data = [["Vessel / Target", "Probability", "Risk Level", "Prediction"]]
    for name, prob, pred in predictions:
        risk_color = get_risk_color(prob)
        risk_label = get_risk_label(prob)
        pred_label = "Positive" if pred == 1 else "Negative"
        
        pred_data.append([
            name,
            f"{prob:.1%}",
            risk_label,
            pred_label
        ])
    
    pred_table = Table(pred_data, colWidths=[70*mm, 30*mm, 35*mm, 35*mm])
    pred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, MEDIUM_GRAY),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
    ]))
    
    # Add risk colors to risk level column
    for i, (_, prob, _) in enumerate(predictions, 1):
        risk_color = get_risk_color(prob)
        pred_table.setStyle(TableStyle([
            ('TEXTCOLOR', (2, i), (2, i), risk_color),
            ('FONTNAME', (2, i), (2, i), 'Helvetica-Bold'),
        ]))
    
    story.append(pred_table)
    story.append(Spacer(1, 16))
    
    # Input Features
    story.append(Paragraph("PATIENT INPUT FEATURES", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BLUE, spaceAfter=12))
    
    input_data = analysis.input_data
    if input_data:
        # Group features by category
        feature_groups = {
            "Demographics": ['age', 'gender', 'weight', 'height', 'bmi'],
            "Clinical": ['cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'],
            "Comorbidities": ['dm', 'htn', 'current_smoker', 'ex_smoker', 'fh', 'obesity', 'crf', 'crl'],
            "Echocardiography": ['edv', 'esv', 'ef', 'lv_mass', 'region_rwma', 'lvh'],
        }
        
        for group_name, features in feature_groups.items():
            group_data = [["Feature", "Value"]]
            has_data = False
            for feat in features:
                if feat in input_data and input_data[feat] is not None:
                    value = input_data[feat]
                    if isinstance(value, float):
                        value = f"{value:.2f}"
                    group_data.append([feat.replace('_', ' ').title(), str(value)])
                    has_data = True
            
            if has_data:
                story.append(Paragraph(group_name, subheading_style))
                feat_table = Table(group_data, colWidths=[80*mm, 80*mm])
                feat_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), TEAL),
                    ('TEXTCOLOR', (0, 0), (-1, 0), white),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 8),
                    ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                    ('GRID', (0, 0), (-1, -1), 0.5, MEDIUM_GRAY),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
                ]))
                story.append(feat_table)
                story.append(Spacer(1, 8))
    
    # Feature Contributions
    if analysis.feature_contributions:
        story.append(Paragraph("FEATURE CONTRIBUTIONS (MODEL EXPLAINABILITY)", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=BLUE, spaceAfter=12))
        
        story.append(Paragraph(
            "The following features had the strongest influence on the model's predictions. "
            "Note: Feature importance indicates association, not causation. "
            "SHAP values would provide more granular instance-level explanations.",
            body_style
        ))
        story.append(Spacer(1, 8))
        
        for target in ['CAD', 'LAD', 'LCX', 'RCA']:
            if target in analysis.feature_contributions:
                importance = analysis.feature_contributions[target]
                # Sort by importance and take top 10
                sorted_features = sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True)[:10]
                
                if sorted_features:
                    story.append(Paragraph(f"{target} - Top Contributing Features", subheading_style))
                    
                    contrib_data = [["Feature", "Importance"]]
                    for feat, imp in sorted_features:
                        contrib_data.append([feat.replace('_', ' ').title(), f"{imp:.4f}"])
                    
                    contrib_table = Table(contrib_data, colWidths=[100*mm, 40*mm])
                    contrib_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), BLUE),
                        ('TEXTCOLOR', (0, 0), (-1, 0), white),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 9),
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 8),
                        ('TEXTCOLOR', (0, 1), (-1, -1), DARK_GRAY),
                        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('TOPPADDING', (0, 0), (-1, -1), 3),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                        ('GRID', (0, 0), (-1, -1), 0.5, MEDIUM_GRAY),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
                    ]))
                    story.append(contrib_table)
                    story.append(Spacer(1, 8))
    
    # Model Information
    story.append(PageBreak())
    story.append(Paragraph("MODEL INFORMATION", heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BLUE, spaceAfter=12))
    
    model_info = [
        ["Algorithm", "Ensemble (Random Forest / Gradient Boosting / Logistic Regression)"],
        ["Training Data", "Z-Alizadeh Sani Coronary Artery Disease Dataset"],
        ["Preprocessing", "Median imputation (numerical), Mode imputation (categorical), Standard scaling"],
        ["Feature Selection", "All available features except target leakage columns (CAD, LAD, LCX, RCA, Cath)"],
        ["Validation", "Stratified 80/20 train/test split with 5-fold CV"],
        ["Target Definitions", "CAD: Overall coronary artery disease; LAD/LCX/RCA: Vessel-specific stenosis ≥50%"],
        ["Limitations", "Single-center dataset; Not externally validated; Class imbalance present; Research prototype only"],
    ]
    
    model_table = Table(model_info, colWidths=[50*mm, 110*mm])
    model_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), NAVY),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, MEDIUM_GRAY),
    ]))
    story.append(model_table)
    story.append(Spacer(1, 20))
    
    # Final Disclaimer
    story.append(Paragraph(
        "IMPORTANT MEDICAL DISCLAIMER",
        ParagraphStyle(
            'FinalDisclaimer',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=RED,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            spaceBefore=20,
            spaceAfter=10
        )
    ))
    
    story.append(Paragraph(
        "This report is generated by an AI research prototype (GENEVA) for the "
        "IIT Mandi Multimodal AI Hackathon 2026, Track A. The predictions are based "
        "on machine learning models trained on the Z-Alizadeh Sani dataset and have "
        "<b>not</b> been clinically validated, FDA-approved, or reviewed by medical professionals. "
        "This system should <b>never</b> be used as a substitute for professional medical advice, "
        "diagnosis, or treatment. Always consult a qualified healthcare provider for "
        "any medical concerns or decisions regarding cardiovascular health.",
        ParagraphStyle(
            'DisclaimerBody',
            parent=body_style,
            fontSize=9,
            textColor=DARK_GRAY,
            alignment=TA_JUSTIFY,
            leading=13,
            spaceAfter=8
        )
    ))
    
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=1, color=MEDIUM_GRAY, spaceAfter=10))
    story.append(Paragraph(
        f"Report generated by GENEVA v1.0.0 on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | "
        "IIT Mandi Multimodal AI Hackathon 2026 | Track A: Cardiovascular Risk Visualization & Prediction",
        small_style
    ))
    
    # Build PDF
    doc.build(story)
    
    return str(filepath)