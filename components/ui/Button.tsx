import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={clsx(
          'font-bold rounded-lg transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
          {
            'bg-gold hover:bg-gold-dark text-black': variant === 'primary',
            'bg-blue-600 hover:bg-blue-700 text-white': variant === 'secondary',
            'bg-green-600 hover:bg-green-700 text-white': variant === 'success',
            'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
            'px-4 py-2 text-sm min-h-[44px]': size === 'sm',
            'px-6 py-3 min-h-[48px]': size === 'md',
            'px-8 py-4 text-lg min-h-[48px]': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
