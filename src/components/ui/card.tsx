import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-200 p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
