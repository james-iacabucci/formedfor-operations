
/**
 * Utility functions for cleaning up stale portals in the DOM
 */

/**
 * Safely removes closed portals from the DOM
 * @param selector Additional selector criteria to identify relevant portals
 * @param textContent Text content to match (partial match)
 * @param delay Milliseconds to wait before cleanup (default: 300ms)
 */
export function cleanupClosedPortals(
  selector: string = '', 
  textContent: string = '', 
  delay: number = 300
): void {
  setTimeout(() => {
    try {
      // Select all closed portals as a base
      let portalSelector = '[data-state="closed"]';
      
      // Add additional selector if provided
      if (selector) {
        portalSelector += selector;
      }
      
      const portals = document.querySelectorAll(portalSelector);
      
      portals.forEach(portal => {
        try {
          // Skip if textContent criteria is specified but doesn't match
          if (textContent && !portal.textContent?.includes(textContent)) {
            return;
          }
          
          // CRITICAL: Only attempt to remove portals that are no longer in the viewport
          // or have been closed for a while (determined by a data attribute we'll set)
          const rect = portal.getBoundingClientRect();
          const isOutsideViewport = (
            rect.bottom < 0 || 
            rect.top > window.innerHeight ||
            rect.right < 0 || 
            rect.left > window.innerWidth
          );
          
          // Check closed timestamp if available
          const closedTimestamp = portal.getAttribute('data-closed-time');
          const closedTimeMs = closedTimestamp ? parseInt(closedTimestamp, 10) : 0;
          const hasBeenClosedLongEnough = closedTimeMs && (Date.now() - closedTimeMs) > 1000;
          
          // Only clean up if outside viewport or closed for a while
          if (isOutsideViewport || hasBeenClosedLongEnough) {
            // CRITICAL FIX: Verify parent-child relationship before removal
            const parent = portal.parentNode;
            if (parent && parent.contains(portal)) {
              // Only remove if the portal is actually a child of this parent
              parent.removeChild(portal);
              console.log('Portal successfully removed');
            }
          }
        } catch (removeError) {
          console.error('Error removing specific portal:', removeError);
        }
      });
    } catch (error) {
      console.error('Portal cleanup failed:', error);
    }
  }, delay);
}

/**
 * Sets a timestamp on closed portals to track when they were closed
 * This helps with cleanup decisions
 */
export function markClosedPortals(): void {
  try {
    const newlyClosedPortals = document.querySelectorAll('[data-state="closed"]:not([data-closed-time])');
    newlyClosedPortals.forEach(portal => {
      portal.setAttribute('data-closed-time', Date.now().toString());
    });
  } catch (error) {
    console.error('Error marking closed portals:', error);
  }
}

/**
 * Registers portal cleanup on component unmount
 * Should be called within a useEffect with empty dependencies
 * @param selector Additional selector criteria to identify relevant portals
 * @param textContent Text content to match (partial match)
 * @param delay Milliseconds to wait before cleanup (default: 300ms)
 * @returns Cleanup function for useEffect
 */
export function registerPortalCleanup(
  selector: string = '', 
  textContent: string = '', 
  delay: number = 300
): () => void {
  return () => {
    cleanupClosedPortals(selector, textContent, delay);
  };
}
