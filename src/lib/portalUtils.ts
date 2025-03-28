
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
          
          // CRITICAL FIX: Verify parent-child relationship before removal
          const parent = portal.parentNode;
          if (parent && parent.contains(portal)) {
            // Only remove if the portal is actually a child of this parent
            parent.removeChild(portal);
            console.log('Portal successfully removed');
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
