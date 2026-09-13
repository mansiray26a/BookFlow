import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-white border border-gray-200 rounded-lg shadow-card transition-shadow duration-200',
          onClick && 'cursor-pointer hover:shadow-card-hover',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
