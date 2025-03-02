
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
      console.log("Initial load, scrolling to bottom immediately");
      // Ensure DOM has fully rendered before scrolling
      setTimeout(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
      }, 150); // Slightly increased delay to ensure DOM is ready
    }
  }, [isLoading, messages, isInitialLoad, setIsInitialLoad]);

  // Effect to handle smooth scrolling to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom && !isLoading) {
      console.log("New messages arrived, scrolling to bottom smoothly");
      requestAnimationFrame(() => {
        scrollToBottom(false);
        setShouldScrollToBottom(false);
      });
    }
  }, [messages, shouldScrollToBottom, isLoading]);

  // Effect to handle scrolling when switching between threads
  useEffect(() => {
    if (messages.length > 0) {
      // Reset state when messages change (like when switching threads)
      setHasScrolled(false);
      setIsInitialLoad(true);
    }
  }, [messages.length === 0]);

  const scrollToBottom = (instant: boolean) => {
    if (!scrollRef.current) {
      console.log("ScrollRef not available for scrolling");
      return;
    }
    
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      console.log(`Scrolling to bottom (instant: ${instant})`);
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
        
        // Reset auto-scrolling flag after animation completes
        setTimeout(() => setIsAutoScrolling(false), 350);
      }
      
      // Update last message reference after scrolling
      if (messages.length > 0) {
        lastMessageRef.current = messages[messages.length - 1].id;
      }
    } else {
      console.log("Scroll element not found");
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const viewport = scrollRef.current;
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

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage, hasScrolled, messages, isAutoScrolling, lastMessageRef, fetchNextPage]);

  return {
    scrollRef,
    hasScrolled,
    setShouldScrollToBottom,
    scrollToBottom
  };
}
