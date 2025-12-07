import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-light to-secondary-light text-white shadow-lg dark:from-primary-dark dark:to-secondary-dark',
    secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600',
    outline: 'bg-transparent border-2 border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark dark:hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;