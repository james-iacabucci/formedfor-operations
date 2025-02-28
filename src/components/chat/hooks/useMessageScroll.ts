
import { useEffect, useRef, useState } from "react";

interface UseMessageScrollProps {
  isLoading: boolean;
  messages: any[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isInitialLoad: boolean;
  setIsInitialLoad: (value: boolean) => void;
  lastMessageRef: React.MutableRefObject<string | null>;
}

export function useMessageScroll({
  isLoading,
  messages,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isInitialLoad,
  setIsInitialLoad,
  lastMessageRef
}: UseMessageScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Effect to handle initial render scroll to bottom
  useEffect(() => {
    if (isInitialLoad && !isLoading && messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
      });
    }
  }, [isLoading, messages, isInitialLoad, setIsInitialLoad]);

  // Effect to handle smooth scrolling to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && !isLoading) {
      requestAnimationFrame(() => {
        scrollToBottom(false);
        setShouldScrollToBottom(false);
      });
    }
  }, [messages, shouldScrollToBottom, isLoading]);

  const scrollToBottom = (instant: boolean) => {
    if (!scrollRef.current) return;
    
    const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      setIsAutoScrolling(true);
      
      if (instant) {
        // Instant scroll (for initial load)
        scrollElement.scrollTop = scrollElement.scrollHeight;
        setTimeout(() => setIsAutoScrolling(false), 100);
      } else {
        // Smooth scroll (for new messages)
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
        
        // Reset auto-scrolling flag after animation completes (roughly 300ms)
        setTimeout(() => setIsAutoScrolling(false), 350);
      }
    }
  };

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || isAutoScrolling) return;

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;

    // Mark that user has manually scrolled (only if not auto-scrolling)
    if (!hasScrolled) {
      setHasScrolled(true);
    }

    // Load more messages when scrolling near the top
    if (scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
      console.log('Triggering next page load');
      fetchNextPage();
    }

    // Check if user has scrolled to the bottom again
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
    if (isNearBottom) {
      setHasScrolled(false);
      
      // Update the last message reference for real-time updates
      if (messages.length > 0) {
        lastMessageRef.current = messages[messages.length - 1].id;
      }
    }
  };

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewportRef.current = viewport as HTMLDivElement;
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage]);

  return {
    scrollRef,
    hasScrolled,
    setShouldScrollToBottom,
    scrollToBottom
  };
}
