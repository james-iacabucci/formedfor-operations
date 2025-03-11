
import { useEffect, useRef, useState } from "react";
import { ThreadMessageWithProfile } from "../types";

interface UseMessageScrollProps {
  isLoading: boolean;
  data?: { pages?: ThreadMessageWithProfile[][] };
  uploadingFiles: any[];
}

export function useMessageScroll({ isLoading, data, uploadingFiles }: UseMessageScrollProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Auto-scroll to bottom when component initially loads or when new messages arrive
  useEffect(() => {
    if (!isLoading && scrollAreaRef.current && shouldScrollToBottom) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
            if (!initialLoadComplete) {
              setInitialLoadComplete(true);
            }
            setShouldScrollToBottom(false);
          }
        }
      }, 100);
    }
  }, [isLoading, data, shouldScrollToBottom]);

  // Set shouldScrollToBottom to true when uploadingFiles changes
  useEffect(() => {
    if (uploadingFiles.length > 0) {
      setShouldScrollToBottom(true);
    }
  }, [uploadingFiles]);

  return {
    scrollAreaRef,
    setShouldScrollToBottom
  };
}
