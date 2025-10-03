'use client';

interface Props {
  error?: string;
  className?: string;
}

export default function ValidationError({ error, className = '' }: Props) {
  if (!error) return null;

  return (
    <p className={`text-xs text-red-600 dark:text-red-400 mt-1 ${className}`}>
      {error}
    </p>
  );
}
