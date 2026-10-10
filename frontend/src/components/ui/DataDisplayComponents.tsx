import { forwardRef, type ReactNode } from 'react'
import { cn, formatNumber, formatPercent, getRiskBadgeClass, getRiskLabel } from '../../utils/helpers'
import { Badge } from './FormComponents'

export { Badge } from './FormComponents'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: ReactNode
  color: 'blue' | 'teal' | 'amber' | 'red' | 'purple' | 'green'
  trend?: 'up' | 'down' | 'neutral'
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  teal: 'bg-teal-50 text-teal-600 border-teal-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  green: 'bg-green-50 text-green-600 border-green-200',
}

const iconBgClasses = {
  blue: 'bg-blue-100',
  teal: 'bg-teal-100',
  amber: 'bg-amber-100',
  red: 'bg-red-100',
  purple: 'bg-purple-100',
  green: 'bg-green-100',
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, change, changeType = 'neutral', icon, color = 'blue', trend = 'neutral', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card p-6', props.className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
              {change && (
                <span className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  changeType === 'positive' ? 'text-green-600' :
                  changeType === 'negative' ? 'text-red-600' :
                  'text-gray-500'
                )}>
                  {trend === 'up' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                  {trend === 'down' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className={cn('p-3 rounded-xl flex-shrink-0', iconBgClasses[color])}>
            {icon}
          </div>
        </div>
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export interface RiskIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  probability: number
  prediction: number
  showLabel?: boolean
}

export const RiskIndicator = forwardRef<HTMLDivElement, RiskIndicatorProps>(
  ({ label, probability, prediction, showLabel = true, ...props }, ref) => {
    const badgeClass = getRiskBadgeClass(probability)
    const riskLabel = getRiskLabel(probability)
    const predLabel = prediction === 1 ? 'Positive' : 'Negative'

    return (
      <div ref={ref} className={cn('p-4 rounded-lg border', props.className)}>
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">{label}</span>
            <Badge variant={badgeClass.replace('badge-', '') as 'green' | 'amber' | 'red'}>
              {riskLabel}
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{formatPercent(probability, 1)}</p>
            <p className="text-sm text-gray-500">Probability</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{predLabel}</p>
            <p className="text-sm text-gray-500">Prediction</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', 
              probability >= 0.7 ? 'bg-red-500' :
              probability >= 0.4 ? 'bg-amber-500' :
              'bg-green-500'
            )}
            style={{ width: `${probability * 100}%` }}
          />
        </div>
      </div>
    )
  }
)

RiskIndicator.displayName = 'RiskIndicator'

export interface PredictionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  probability: number
  prediction: number
  color?: 'blue' | 'red' | 'teal' | 'amber' | 'purple'
  icon?: ReactNode
}

export const PredictionCard = forwardRef<HTMLDivElement, PredictionCardProps>(
  ({ title, probability, prediction, color = 'blue', icon, ...props }, ref) => {
    const badgeClass = getRiskBadgeClass(probability)
    const riskLabel = getRiskLabel(probability)
    const predLabel = prediction === 1 ? 'Positive' : 'Negative'

    return (
      <div ref={ref} className={cn('card p-6', props.className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && <div className={cn('p-2 rounded-lg', `bg-${color}-100`, `text-${color}-600`)}>{icon}</div>}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Vessel-specific stenosis prediction</p>
            </div>
          </div>
          <Badge variant={badgeClass.replace('badge-', '') as 'green' | 'amber' | 'red'}>
            {riskLabel}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <p className="text-3xl font-bold text-gray-900">{formatPercent(probability, 1)}</p>
            <p className="text-sm text-gray-500">Probability</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <p className="text-3xl font-bold text-gray-900">{predLabel}</p>
            <p className="text-sm text-gray-500">Prediction</p>
          </div>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500',
              probability >= 0.7 ? 'bg-red-500' :
              probability >= 0.4 ? 'bg-amber-500' :
              'bg-green-500'
            )}
            style={{ width: `${probability * 100}%` }}
          />
        </div>
      </div>
    )
  }
)

PredictionCard.displayName = 'PredictionCard'

export interface TableProps<T> {
  columns: { key: string; header: string; render?: (row: T) => ReactNode; className?: string }[]
  data: T[]
  keyExtractor: (row: T) => string
  emptyMessage?: string
  striped?: boolean
  hoverable?: boolean
  className?: string
}

export function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyMessage = 'No data available',
  striped = true,
  hoverable = true,
  className,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('table-container', className)}>
      <table className="table" role="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className={cn(column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyExtractor(row)} className={cn(hoverable && 'hover:bg-gray-50', striped && 'even:bg-white odd:bg-gray-50')}>
              {columns.map((column) => (
                <td key={String(column.key)} className={cn(column.className)}>
                  {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  onDismiss?: () => void
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ type, title, message, onDismiss, ...props }, ref) => {
    const typeClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    }

    const iconMap = {
      info: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      success: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    }

    return (
      <div
        ref={ref}
        className={cn('flex gap-3 p-4 rounded-lg border', typeClasses[type], props.className)}
        role="alert"
        {...props}
      >
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <div className="flex-1">
          {title && <h4 className="font-medium">{title}</h4>}
          <p className={cn('text-sm', title && 'mt-1')}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export interface ConfusionMatrixProps {
  matrix: number[][]
  labels: string[]
  title?: string
}

export function ConfusionMatrixComponent({ matrix, labels, title }: ConfusionMatrixProps) {
  const total = matrix.flat().reduce((a, b) => a + b, 0)
  
  return (
    <div className="card p-6">
      {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="p-3 text-left font-medium text-gray-500">Actual \ Predicted</th>
              {labels.map((label) => (
                <th key={label} className="p-3 font-medium text-gray-500">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th className="p-3 text-left font-medium text-gray-900">{labels[i]}</th>
                {row.map((val, j) => {
                  const percent = total > 0 ? (val / total * 100).toFixed(1) : '0'
                  const isDiagonal = i === j
                  return (
                    <td key={j} className={cn(
                      'p-4 font-mono text-lg',
                      isDiagonal ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    )}>
                      <div>{val}</div>
                      <div className="text-xs text-gray-500 mt-1">({percent}%)</div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

