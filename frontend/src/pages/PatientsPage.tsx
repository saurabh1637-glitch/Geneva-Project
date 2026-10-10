'use client'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Button } from '../components/ui/FormComponents'
import { Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Input } from '../components/ui/FormComponents'
import { Container, Section, Flex } from '../components/ui/LayoutComponents'
import { Search, Plus, Eye, Filter, ChevronLeft, ChevronRight, FileText, User } from 'lucide-react'
import { formatDateTime, cn } from '../utils/helpers'
import type { Patient, PatientListResponse, Analysis } from '../types'

const mockPatients: Patient[] = [
  { id: 1, patient_id: 'PAT-001', age: 58, gender: 'Male', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-01-15T10:30:00Z' },
  { id: 2, patient_id: 'PAT-002', age: 45, gender: 'Female', created_at: '2024-01-14T14:20:00Z', updated_at: '2024-01-14T14:20:00Z' },
  { id: 3, patient_id: 'PAT-003', age: 62, gender: 'Male', created_at: '2024-01-13T09:15:00Z', updated_at: '2024-01-13T09:15:00Z' },
  { id: 4, patient_id: 'PAT-004', age: 51, gender: 'Female', created_at: '2024-01-12T16:45:00Z', updated_at: '2024-01-12T16:45:00Z' },
  { id: 5, patient_id: 'PAT-005', age: 67, gender: 'Male', created_at: '2024-01-11T11:00:00Z', updated_at: '2024-01-11T11:00:00Z' },
]

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [page, search])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await api.listPatients(page, pageSize, search || undefined)
      setPatients(response.patients)
      setTotal(response.total)
      setIsDemoData(false)
    } catch (err) {
      console.warn('Using demo data:', err)
      // Use mock data
      const filtered = mockPatients.filter(p => 
        p.patient_id.toLowerCase().includes(search.toLowerCase())
      )
      const start = (page - 1) * pageSize
      setPatients(filtered.slice(start, start + pageSize))
      setTotal(filtered.length)
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="full" className="w-full">
        {/* Header */}
        <Flex justify="between" align="center" wrap className="mb-5 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
            <p className="text-gray-600 mt-1">Manage and view patient records and analysis history</p>
          </div>
          <Flex gap={2}>
            <Link to="/patients/new">
              <Button icon={<Plus className="w-4 h-4" />}>New Patient</Button>
            </Link>
          </Flex>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample patient records. Connect to backend to view real data." className="mb-4" />
        )}

        {/* Search and Filter */}
        <Card className="mb-4">
          <CardBody>
            <Flex gap={4} wrap align="center">
              <div className="relative flex-1 min-w-[220px] max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by patient ID..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                Showing {patients.length} of {total} patients
              </div>
            </Flex>
          </CardBody>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-500">Loading patients...</p>
              </div>
            ) : (
              <Table
                columns={[
                  { key: 'patient_id', header: 'Patient ID', render: (row: Patient) => (
                    <Link to={`/patients/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {row.patient_id}
                    </Link>
                  )},
                  { key: 'age', header: 'Age' },
                  { key: 'gender', header: 'Gender', render: (row: Patient) => (
                    <Badge variant={row.gender === 'Male' ? 'blue' : 'teal'}>
                      {row.gender}
                    </Badge>
                  )},
                  { key: 'created_at', header: 'Created', render: (row: Patient) => formatDateTime(row.created_at) },
                  { key: 'actions', header: 'Actions', render: (row: Patient) => (
                    <Flex gap={1}>
                      <Link to={`/patients/${row.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                      </Link>
                    </Flex>
                  )},
                ]}
                data={patients}
                keyExtractor={(row) => row.id.toString()}
                emptyMessage="No patients found. Create your first patient record."
              />
            )}

            {/* Pagination */}
            {total > pageSize && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Page {page} of {Math.ceil(total / pageSize)}
                </span>
                <Flex gap={2}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<ChevronLeft className="w-4 h-4" />}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                    disabled={page === Math.ceil(total / pageSize)}
                  />
                </Flex>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
  )
}