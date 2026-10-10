'use client'


import { Container, Section, Grid, Flex } from '../components/ui/LayoutComponents'
import { Card, CardHeader, CardBody, Tabs, Badge } from '../components/ui/FormComponents'
import { Heart, Brain, Database, Code, Users, Shield, Info, AlertCircle, CheckCircle, GitBranch, Zap, Globe } from 'lucide-react'
import { Alert } from '../components/ui/DataDisplayComponents'

const teamMembers = [
  { name: 'Research Team', role: 'IIT Mandi Multimodal AI Hackathon 2026', avatar: 'RT' },
  { name: 'Track A Participants', role: 'Cardiovascular Risk Visualization & Prediction', avatar: 'TA' },
]

const techStack = [
  { category: 'Frontend', icon: Code, items: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'Recharts', 'Three.js / R3F', 'Lucide React'] },
  { category: 'Backend', icon: Brain, items: ['FastAPI', 'Python 3.11+', 'Pydantic', 'SQLAlchemy', 'SQLite', 'Uvicorn'] },
  { category: 'ML & Data', icon: Database, items: ['scikit-learn', 'pandas', 'NumPy', 'SHAP', 'joblib', 'ReportLab', 'openpyxl'] },
  { category: 'Infrastructure', icon: Globe, items: ['CORS', 'REST API', 'Async/Await', 'Docker-ready', 'Environment config'] },
]

const features = [
  { icon: Heart, title: 'Multi-Target Prediction', desc: 'Overall CAD + vessel-specific (LAD, LCX, RCA) stenosis prediction with calibrated probabilities' },
  { icon: GitBranch, title: 'Interactive 3D Heart', desc: 'Real-time anatomical visualization with coronary artery highlighting and risk overlay' },
  { icon: Brain, title: 'Explainable AI', desc: 'SHAP-based feature importance and instance-level explanations for model transparency' },
  { icon: Shield, title: 'Comprehensive Evaluation', desc: 'ROC curves, confusion matrices, per-target metrics with clear methodology documentation' },
  { icon: Zap, title: 'PDF Report Generation', desc: 'Professional clinical-style reports with predictions, explanations, and safety disclaimers' },
  { icon: Database, title: 'Dataset Explorer', desc: 'Full data documentation with missing values, distributions, and preprocessing details' },
]

export function AboutPage() {
  return (
    <Container size="xl">
        {/* Hero */}
        <Section className="mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              GENEVA — AI Cardiovascular Risk Visualization & Prediction System
            </div>
            <h1 className="text-4xl font-bold text-navy mb-4">About GENEVA</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              GENEVA is a research prototype developed for the <strong>IIT Mandi Multimodal AI Hackathon 2026, Track A</strong>. 
              It predicts overall coronary artery disease (CAD) status and vessel-specific stenosis for LAD, LCX, and RCA 
              using the Z-Alizadeh Sani dataset with explainable AI and interactive 3D visualization.
            </p>
          </div>
        </Section>

        {/* Disclaimer */}
        <Alert type="warning" className="mb-8">
          <Flex gap={3} align="start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Research Use Only</p>
              <p className="mt-1 text-amber-800 text-sm">
                This system has <strong>not been clinically validated</strong>, FDA-approved, or reviewed by medical professionals. 
                It is a <strong>research prototype</strong> for educational purposes only and should <strong>never</strong> be used 
                as a substitute for professional medical diagnosis or treatment.
              </p>
            </div>
          </Flex>
        </Alert>

        {/* Key Features */}
        <Section title="Key Features" className="mb-12">
          <Grid cols={3} gap="lg">
            {features.map((feature, i) => (
              <Card key={i} className="h-full">
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Tech Stack */}
        <Section title="Technology Stack" className="mb-12">
          <Grid cols={2} gap="lg">
            {techStack.map((tech, i) => (
              <Card key={i}>
                <CardHeader>
                  <Flex align="center" gap={2}>
                    <tech.icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{tech.category}</h3>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Flex gap={2} wrap>
                    {tech.items.map((item, j) => (
                      <Badge key={j} variant="blue" className="text-xs">{item}</Badge>
                    ))}
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Methodology */}
        <Section title="Methodology Overview" className="mb-12">
          <Tabs
            tabs={[
              { id: 'data', label: 'Data Processing', icon: <Database className="w-4 h-4" /> },
              { id: 'model', label: 'Model Training', icon: <Brain className="w-4 h-4" /> },
              { id: 'eval', label: 'Evaluation', icon: <Shield className="w-4 h-4" /> },
              { id: 'viz', label: 'Visualization', icon: <GitBranch className="w-4 h-4" /> },
            ]}
            activeTab="data"
            onChange={() => {}}
            className="mb-6"
          />
          
          <Grid cols={2} gap="lg">
            <Card className="lg:col-span-2">
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      Data Processing
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Z-Alizadeh Sani dataset loaded from Excel format</li>
                      <li>Target leakage prevention: CAD, LAD, LCX, RCA, Cath excluded from features</li>
                      <li>Numerical: Median imputation + StandardScaler (fitted on train only)</li>
                      <li>Categorical: Mode imputation + LabelEncoder (unseen → -1)</li>
                      <li>Stratified 80/20 train/test split per target (seed=42)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-teal-500" />
                      Model Training
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Algorithms: Random Forest (200 trees), Gradient Boosting (150), Logistic Regression</li>
                      <li>Class balancing: class_weight='balanced' for imbalanced targets</li>
                      <li>Selection criterion: F1-score (primary) with 5-fold stratified CV</li>
                      <li>Best model per target saved independently</li>
                      <li>Models and preprocessors serialized with joblib</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-500" />
                      Evaluation Metrics
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Accuracy, Precision, Recall, F1-Score, ROC-AUC (when valid)</li>
                      <li>Confusion matrices with TP/FP/TN/FN counts</li>
                      <li>ROC curves with AUC for all targets</li>
                      <li>Per-target evaluation (independent models)</li>
                      <li>Honest handling of small samples, missing classes, imbalance</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-500" />
                      Visualization & Explainability
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Procedural 3D heart with LAD/LCX/RCA vessel paths</li>
                      <li>Real-time risk color coding (Green/Amber/Red)</li>
                      <li>Interactive rotation, zoom, and vessel selection</li>
                      <li>SHAP values when supported; feature importance fallback</li>
                      <li>Clear association vs. causation disclaimers</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Grid>
        </Section>

        {/* Dataset Attribution */}
        <Section title="Dataset Attribution">
          <Grid cols={2} gap="lg">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Z-Alizadeh Sani Dataset
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>Source:</strong> UCI Machine Learning Repository</p>
                  <p><strong>DOI:</strong> 10.24432/C5V30N</p>
                  <p><strong>Citation:</strong> Alizadeh Sani, S. (2018). Coronary Artery Disease Dataset.</p>
                  <p><strong>Samples:</strong> 303 patients</p>
                  <p><strong>Features:</strong> 39 clinical, laboratory, echocardiographic variables</p>
                  <p><strong>Targets:</strong> CAD, LAD, LCX, RCA, Cath (binary stenosis ≥50%)</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Model Limitations
                </h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Single-center data — limited generalizability</li>
                  <li>Small sample size — wide confidence intervals</li>
                  <li>Class imbalance in vessel targets</li>
                  <li>No external validation cohort</li>
                  <li>Binary classification only — no severity gradation</li>
                  <li>Not calibrated for clinical probability interpretation</li>
                  <li>Research prototype — NOT for clinical use</li>
                </ul>
              </CardBody>
            </Card>
          </Grid>
        </Section>

        {/* Team */}
        <Section title="Team & Acknowledgments" className="mt-8">
          <Grid cols={2} gap="lg">
            {teamMembers.map((member, i) => (
              <Card key={i}>
                <CardBody className="p-6">
                  <Flex gap={4} align="center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Grid>
          
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <CardBody className="p-6">
              <Flex gap={4} align="start">
                <Info className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Acknowledgments</p>
                  <p className="mt-1">
                    This project was developed for the IIT Mandi Multimodal AI Hackathon 2026. 
                    We thank the organizers, mentors, and the creators of the Z-Alizadeh Sani dataset 
                    for making this research possible. Special thanks to the open-source community 
                    for the amazing libraries that power GENEVA.
                  </p>
                </div>
              </Flex>
            </CardBody>
          </Card>
        </Section>
      </Container>
  )
}