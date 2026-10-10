'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Button } from '../components/ui/FormComponents'
import { Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { Input, Select } from '../components/ui/FormComponents'
import { Alert, Badge } from '../components/ui/DataDisplayComponents'
import { Container, Section, Grid, Flex, Spacer } from '../components/ui/LayoutComponents'
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { formFields, fieldGroups, requiredFields, samplePatientData } from '../utils/formConfig'
import { cn, formatFieldName, getRiskBadgeClass, getRiskLabel } from '../utils/helpers'
import type { PatientInput, PredictionResponse } from '../types'

export function PatientInputPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<PatientInput>({
    age: 50,
    gender: 1,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 0,
    slope: 1,
    ca: 0,
    thal: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PatientInput, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})

  // Load sample data on mount
  useEffect(() => {
    // Sample data is already in formData default
  }, [])

  const validateField = (name: keyof PatientInput, value: unknown): string | null => {
    const fieldConfig = formFields.find(f => f.name === name)
    if (!fieldConfig) return null

    if (fieldConfig.required && (value === '' || value === null || value === undefined)) {
      return `${fieldConfig.label} is required`
    }

    if (typeof value === 'number') {
      if (fieldConfig.min !== undefined && value < fieldConfig.min) {
        return `${fieldConfig.label} must be at least ${fieldConfig.min}`
      }
      if (fieldConfig.max !== undefined && value > fieldConfig.max) {
        return `${fieldConfig.label} must be at most ${fieldConfig.max}`
      }
    }

    return null
  }

  const handleChange = (name: keyof PatientInput, value: string | number) => {
    const numValue = typeof value === 'string' && value !== '' ? parseFloat(value) : value
    setFormData(prev => ({ ...prev, [name]: numValue }))
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof PatientInput, string>> = {}
    let isValid = true

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const loadSampleData = () => {
    setFormData(prev => ({ ...prev, ...samplePatientData }))
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAll()) {
      setError('Please fix the validation errors above')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await api.predictRisk(formData)
      setPrediction(result)
      setSubmitted(true)
      setShowReview(false)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleNewAnalysis = () => {
    setFormData({
      age: 50,
      gender: 1,
      cp: 0,
      trestbps: 120,
      chol: 200,
      fbs: 0,
      restecg: 0,
      thalach: 150,
      exang: 0,
      oldpeak: 0,
      slope: 1,
      ca: 0,
      thal: 0,
    })
    setErrors({})
    setPrediction(null)
    setSubmitted(false)
    setShowReview(false)
    setError(null)
  }

  const getFieldConfig = (name: keyof PatientInput) => formFields.find(f => f.name === name)

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Patient Analysis</h1>
            <p className="text-gray-600 mt-1">Enter patient clinical data for cardiovascular risk prediction</p>
          </div>
          <Flex gap={2}>
            <Button variant="secondary" onClick={loadSampleData} icon={<FileText className="w-4 h-4" />}>
              Load Sample
            </Button>
          </Flex>
        </Flex>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {submitted && prediction && (
          <Alert type="success" title="Prediction Complete" message="Results generated successfully. Review below or navigate to Results page." className="mb-6" />
        )}

        {!submitted ? (
          <>
            {/* Input Form */}
            <form onSubmit={handleSubmit}>
              {fieldGroups.map((group) => {
                const groupFields = formFields.filter(f => f.group === group)
                if (groupFields.length === 0) return null

                return (
                  <Card key={group} className="mb-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">{group}</h3>
                    </CardHeader>
                    <CardBody>
                      <Grid cols={3} gap="md">
                        {groupFields.map((field) => {
                          const error = errors[field.name as keyof PatientInput]
                          const isRequired = requiredFields.includes(field.name as keyof PatientInput)
                          
                          return (
                            <div key={field.name} className={cn(field.name === 'age' && 'col-span-1')}>
                              {field.type === 'select' ? (
                                <Select
                                  label={field.label}
                                  value={formData[field.name] as string | number}
                                  onChange={(e) => handleChange(field.name, e.target.value)}
                                  options={field.options!.map(o => ({ value: o.value, label: o.label }))}
                                  placeholder="Select..."
                                  error={error}
                                  helperText={field.description}
                                  required={isRequired}
                                />
                              ) : (
                                <Input
                                  label={field.label}
                                  type="number"
                                  value={formData[field.name] as string | number}
                                  onChange={(e) => handleChange(field.name, e.target.value)}
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                  error={error}
                                  helperText={field.description}
                                  required={isRequired}
                                  placeholder={field.description}
                                />
                              )}
                            </div>
                          )
                        })}
                      </Grid>
                    </CardBody>
                  </Card>
                )
              })}

              {/* Action Buttons */}
              <Flex justify="end" gap={3} className="pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setShowReview(true)}>
                  <Eye className="w-4 h-4" />
                  Review Inputs
                </Button>
                <Button type="submit" isLoading={loading} icon={<ArrowRight className="w-4 h-4" />}>
                  Predict Risk
                </Button>
              </Flex>
            </form>
          </>
        ) : (
          <>
            {/* Results Summary */}
<Card className="mb-6">
              <CardHeader>
                <Flex justify="between" align="center">
                  <h3 className="text-lg font-semibold text-gray-900">Prediction Results</h3>
                  <Badge variant={prediction ? getRiskBadgeClass(prediction.cad_probability).replace('badge-', '') as 'red' | 'amber' | 'green' : 'blue'} className="mt-2">
                    {prediction ? getRiskLabel(prediction.cad_probability) + ' — ' + (prediction.cad_probability * 100).toFixed(1) + '%' : 'No prediction'}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid cols={4} gap="md">
                  {(() => {
                  if (!prediction) return null
                  const items = [
                    { label: 'Overall CAD', prob: prediction.cad_probability, pred: prediction.cad_prediction },
                    { label: 'LAD', prob: prediction.lad_probability, pred: prediction.lad_prediction },
                    { label: 'LCX', prob: prediction.lcx_probability, pred: prediction.lcx_prediction },
                    { label: 'RCA', prob: prediction.rca_probability, pred: prediction.rca_prediction },
                  ]
                  return items.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 text-center">
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{(item.prob * 100).toFixed(1)}%</p>
                      <Badge variant={getRiskBadgeClass(item.prob).replace('badge-', '') as 'red' | 'amber' | 'green'} className="mt-2">
                        {item.pred === 1 ? 'Positive' : 'Negative'}
                      </Badge>
                    </div>
                  ))
                })()}
                </Grid>
                
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Flex gap={3} align="start">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm text-red-800">
                      <p className="font-medium">Research Use Only</p>
                      <p className="mt-1">This prediction is generated by a research prototype and has not been clinically validated. 
                      It should not be used as a substitute for professional medical diagnosis.</p>
                    </div>
                  </Flex>
                </div>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <Flex justify="between" align="center">
              <Button variant="secondary" onClick={handleNewAnalysis} icon={<ArrowLeft className="w-4 h-4" />}>
                New Analysis
              </Button>
              <Flex gap={3}>
                <Button variant="secondary" onClick={() => navigate('/heart-3d')} icon={<Eye className="w-4 h-4" />}>
                  View 3D Heart
                </Button>
                <Button onClick={() => navigate('/explainability')} icon={<ArrowRight className="w-4 h-4" />}>
                  View Explainability
                </Button>
              </Flex>
            </Flex>
          </>
        )}

        {/* Review Modal */}
        {showReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReview(false)}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Review Input Data</h3>
                <button onClick={() => setShowReview(false)} className="p-2 text-gray-500 hover:text-gray-700">
                  <EyeOff className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardBody>
                {fieldGroups.map((group) => {
                  const groupFields = formFields.filter(f => f.group === group)
                  const hasData = groupFields.some(f => {
                    const value = formData[f.name as keyof PatientInput]
                    return value !== undefined && value !== null && String(value) !== '' && value !== 0
                  })
                  if (!hasData) return null

                  return (
                    <div key={group} className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">{group}</h4>
                      <Grid cols={2} gap="md">
                        {groupFields.map((field) => {
                          const value = formData[field.name as keyof PatientInput]
                          if (value === undefined || value === null || String(value) === '' || value === 0) return null
                          
                          return (
                            <div key={field.name} className="flex justify-between py-1">
                              <span className="text-gray-500">{field.label}</span>
                              <span className="font-medium text-gray-900">{typeof value === 'number' ? value.toString() : value}</span>
                            </div>
                          )
                        })}
                      </Grid>
                    </div>
                  )
                })}
              </CardBody>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowReview(false)}>Close</Button>
                <Button onClick={handleSubmit} isLoading={loading}>Confirm & Predict</Button>
              </div>
            </div>
          </div>
        )}
      </Container>
  )
}