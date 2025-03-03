
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  if (!content) return null;
  
  return (
    <div className={`rich-text-content prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
