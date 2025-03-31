
import { useEffect, useRef } from "react";

export function useTextareaAutosize(value: string = "") {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = "0";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener("input", adjustHeight);
    
    requestAnimationFrame(() => {
      adjustHeight();
    });

    return () => textarea.removeEventListener("input", adjustHeight);
  }, []);

  useEffect(() => {
    if (value) {
      setTimeout(() => {
        adjustHeight();
      }, 0);
    }
  }, [value]);

  return { textareaRef, adjustHeight };
}
