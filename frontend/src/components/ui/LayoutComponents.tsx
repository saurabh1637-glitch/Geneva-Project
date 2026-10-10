import { forwardRef, type ReactNode } from 'react'
import { cn } from '../../utils/helpers'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      // App pages already sit inside MainLayout's responsive padding. Let xl
      // pages use the full available content width instead of adding a second
      // centered max-width container (which creates large blank side gutters).
      xl: 'w-full max-w-none',
      full: 'w-full max-w-full',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'min-w-0',
          size === 'xl' || size === 'full' ? '' : 'mx-auto px-4 sm:px-6 lg:px-8',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode
  title?: string
  description?: string
  action?: ReactNode
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ title, description, action, className, children, ...props }, ref) => (
    <section ref={ref} className={cn('py-8', className)} {...props}>
      <div className="mb-6">
        {(title || description) && (
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
              {description && <p className="mt-1 text-gray-600">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
      </div>
      {children}
    </section>
  )
)

Section.displayName = 'Section'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 12
  gap?: 'sm' | 'md' | 'lg'
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, gap = 'md', className, children, ...props }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-12',
    }

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    }

    return (
      <div
        ref={ref}
        className={cn('grid', colsClasses[cols], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: 'sm' | 'md' | 'lg' | 'xl' | number
  wrap?: boolean
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    direction = 'row', 
    align = 'stretch', 
    justify = 'start', 
    gap = 'md', 
    wrap = false,
    className, 
    children, 
    ...props 
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    }

    const getGapClass = (gap: 'sm' | 'md' | 'lg' | 'xl' | number) => {
      if (typeof gap === 'number') {
        return `gap-${gap}`
      }
      const gapClasses = {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
      }
      return gapClasses[gap]
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          getGapClass(gap),
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Flex.displayName = 'Flex'

export const Divider = forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn('border-gray-200', className)}
      {...props}
    />
  )
)

Divider.displayName = 'Divider'

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-2',
      sm: 'h-4',
      md: 'h-8',
      lg: 'h-12',
      xl: 'h-16',
    }

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    )
  }
)

Spacer.displayName = 'Spacer'