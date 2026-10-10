import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts'
import { cn } from '../../utils/helpers'

const COLORS = {
  blue: '#2563EB',
  teal: '#0D9488',
  amber: '#D97706',
  red: '#DC2626',
  green: '#16A34A',
  purple: '#9333EA',
  navy: '#102A43',
  gray: '#9CA3AF',
}

const CHART_COLORS = [COLORS.blue, COLORS.teal, COLORS.amber, COLORS.red, COLORS.green, COLORS.purple]

export interface ChartContainerProps {
  children: React.ReactElement
  height?: number
  className?: string
}

export const ChartContainer = ({ children, height = 300, className }: ChartContainerProps) => (
  <div className={cn('w-full', className)} style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
)

export interface LineChartProps {
  data: Record<string, string | number>[]
  xKey: string
  lines: { key: string; name: string; color?: string; strokeWidth?: number; dot?: boolean }[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  yDomain?: [number, number]
  tooltipFormatter?: (value: number, name: string) => [string, string]
}

export function LineChartComponent({ 
  data, 
  xKey, 
  lines, 
  height = 300, 
  showGrid = true, 
  showLegend = true,
  yDomain,
  tooltipFormatter,
}: LineChartProps) {
  return (
    <ChartContainer height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis 
          dataKey={xKey} 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
          domain={yDomain || ['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
          formatter={tooltipFormatter}
        />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 20 }} />}
{lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={line.strokeWidth || 2}
                dot={line.dot !== false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
      </LineChart>
    </ChartContainer>
  )
}

export interface AreaChartProps {
  data: Record<string, string | number>[]
  xKey: string
  areas: { key: string; name: string; color?: string; opacity?: number }[]
  height?: number
  stacked?: boolean
  tooltipFormatter?: (value: number, name: string) => [string, string]
}

export function AreaChartComponent({ 
  data, 
  xKey, 
  areas, 
  height = 300, 
  stacked = false,
  tooltipFormatter,
}: AreaChartProps) {
  return (
    <ChartContainer height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey={xKey} 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
          formatter={tooltipFormatter}
        />
        <Legend wrapperStyle={{ paddingTop: 20 }} />
        {areas.map((area, index) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stroke={area.color || CHART_COLORS[index % CHART_COLORS.length]}
            fill={area.color || CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={area.opacity || 0.3}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}

export interface BarChartProps {
  data: Record<string, string | number>[]
  xKey: string
  bars: { key: string; name: string; color?: string }[]
  height?: number
  horizontal?: boolean
  stacked?: boolean
  tooltipFormatter?: (value: number, name: string) => [string, string]
}

export function BarChartComponent({ 
  data, 
  xKey, 
  bars, 
  height = 300, 
  horizontal = false,
  stacked = false,
  tooltipFormatter,
}: BarChartProps) {
  if (horizontal) {
    return (
      <ChartContainer height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <YAxis 
            type="category" 
            dataKey={xKey} 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <XAxis 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
            formatter={tooltipFormatter}
          />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
              stackId={stacked ? 'stack' : undefined}
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey={xKey} 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
          formatter={tooltipFormatter}
        />
        <Legend wrapperStyle={{ paddingTop: 20 }} />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

export interface PieChartProps {
  data: { name: string; value: number; color?: string }[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  labelLine?: boolean
}

export function PieChartComponent({ 
  data, 
  height = 300, 
  innerRadius = 60, 
  outerRadius = 100,
  showLegend = true,
  labelLine = true,
}: PieChartProps) {
  return (
    <ChartContainer height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          labelLine={labelLine}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
        />
        {showLegend && <Legend wrapperStyle={{ paddingTop: 20 }} />}
      </PieChart>
    </ChartContainer>
  )
}

export interface ROCChartProps {
  curves: { name: string; data: { fpr: number; tpr: number }[]; color?: string; auc?: number }[]
  height?: number
}

export function ROCChartComponent({ curves, height = 350 }: ROCChartProps) {
  // Generate diagonal reference line
  const referenceLine = Array.from({ length: 21 }, (_, i) => ({
    fpr: i / 20,
    tpr: i / 20,
  }))

  return (
    <ChartContainer height={height}>
      <ComposedChart data={referenceLine} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="fpr" 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          domain={[0, 1]}
          tickFormatter={(v) => v.toFixed(1)}
        />
        <YAxis 
          dataKey="tpr"
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          domain={[0, 1]}
          tickFormatter={(v) => v.toFixed(1)}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
          formatter={(value: number) => [value.toFixed(3), '']}
        />
        <Legend wrapperStyle={{ paddingTop: 20 }} />
        
        {/* Reference line */}
        <Line
          type="linear"
          dataKey="tpr"
          stroke={COLORS.gray}
          strokeDasharray="5 5"
          strokeWidth={1}
          dot={false}
          name="Random Classifier"
        />
        
        {/* ROC curves */}
{curves.map((curve, index) => (
            <Line
              key={curve.name}
              type="monotone"
              data={curve.data}
              dataKey="tpr"
              name={curve.auc !== undefined ? `${curve.name} (AUC: ${curve.auc.toFixed(3)})` : curve.name}
              stroke={curve.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
      </ComposedChart>
    </ChartContainer>
  )
}

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