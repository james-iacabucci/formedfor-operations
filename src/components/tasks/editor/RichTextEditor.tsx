
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Add a description...",
  disabled = false
}: RichTextEditorProps) {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  };

  const insertFormat = (prefix: string, suffix: string = prefix) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const currentValue = textarea.value;
      const selectedText = currentValue.substring(selectionStart, selectionEnd);
      
      const newValue = 
        currentValue.substring(0, selectionStart) + 
        prefix + selectedText + suffix + 
        currentValue.substring(selectionEnd);
      
      onChange(newValue);
      
      // Focus back to the textarea after inserting format
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = selectionStart + prefix.length;
        textarea.selectionEnd = selectionStart + prefix.length + selectedText.length;
        handleSelectionChange();
      }, 0);
    }
  };

  const insertLink = () => {
    if (textareaRef.current) {
      const selectedText = value.substring(selectionStart, selectionEnd);
      const url = prompt("Enter URL:", "https://");
      
      if (url) {
        const linkText = selectionStart !== selectionEnd 
          ? selectedText 
          : prompt("Enter link text:", "Link text") || "Link";
        
        insertFormat(`[${linkText}](${url})`, "");
      }
    }
  };

  return (
    <div className="rich-text-editor border rounded-md">
      <div className="toolbar flex items-center gap-1 p-1 border-b bg-muted/30">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => insertFormat("**")}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => insertFormat("*")}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={insertLink}
          disabled={disabled}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => insertFormat("- ")}
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => insertFormat("1. ")}
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelectionChange}
        placeholder={placeholder}
        className="min-h-[150px] border-none focus-visible:ring-0 resize-y"
        disabled={disabled}
      />
    </div>
  );
}
