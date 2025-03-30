
/**
 * Utility functions for cleaning up stale portals in the DOM
 */

type PortalCleanupOptions = {
  selector?: string;
  textContent?: string;
  minTimeClosedMs?: number;
}

/**
 * Safely removes closed portals from the DOM only when the browser is idle
 * and only for portals that meet strict safety criteria
 */
export function cleanupClosedPortals(options: PortalCleanupOptions = {}): void {
  const {
    selector = '',
    textContent = '',
    minTimeClosedMs = 10000 // Default to 10 seconds
  } = options;
  
  // Use requestIdleCallback for non-urgent cleanup
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
  
  idleCallback(() => {
    try {
      console.log('[Portal Debug] Running idle cleanup check');
      
      // Select all closed portals as a base
      let portalSelector = '[data-state="closed"]';
      
      // Add additional selector if provided
      if (selector) {
        portalSelector += selector;
      }
      
      const portals = document.querySelectorAll(portalSelector);
      let cleanedCount = 0;
      
      portals.forEach(portal => {
        try {
          // Skip if textContent criteria is specified but doesn't match
          if (textContent && !portal.textContent?.includes(textContent)) {
            return;
          }
          
          // CRITICAL: Only clean portals with explicit flags and other safety checks
          const closedTimestamp = portal.getAttribute('data-closed-time');
          const closedTimeMs = closedTimestamp ? parseInt(closedTimestamp, 10) : 0;
          const timeClosed = closedTimeMs ? (Date.now() - closedTimeMs) : 0;
          
          // Check if portal has been closed long enough
          const hasBeenClosedLongEnough = timeClosed > minTimeClosedMs;
          
          // Check if portal is outside viewport
          const rect = portal.getBoundingClientRect();
          const isOutsideViewport = (
            rect.bottom < 0 || 
            rect.top > window.innerHeight ||
            rect.right < 0 || 
            rect.left > window.innerWidth
          );
          
          // Check for key safety attributes
          const isAllowedToBeRemoved = portal.getAttribute('data-allow-cleanup') === 'true';
          const isDropdownPortal = portal.getAttribute('data-radix-dropdown-menu-content') !== null;
          
          // Special protection: never remove dropdown menu portals
          if (isDropdownPortal) {
            console.log('[Portal Debug] Skipping dropdown portal');
            return;
          }
          
          // Safe cleanup - multiple strict conditions
          if (isAllowedToBeRemoved && hasBeenClosedLongEnough && isOutsideViewport) {
            // Extra safety check for parent-child relationship
            const parent = portal.parentNode;
            if (parent && parent.contains(portal)) {
              console.log(`[Portal Debug] Safely removing portal closed for ${timeClosed}ms`);
              parent.removeChild(portal);
              cleanedCount++;
            }
          } else {
            // Log why we're not removing
            if (!isAllowedToBeRemoved) console.log('[Portal Debug] Portal not marked for cleanup');
            if (!hasBeenClosedLongEnough) console.log(`[Portal Debug] Portal only closed for ${timeClosed}ms`);
            if (!isOutsideViewport) console.log('[Portal Debug] Portal still in viewport');
          }
        } catch (removeError) {
          console.error('[Portal Debug] Error removing specific portal:', removeError);
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`[Portal Debug] Cleaned up ${cleanedCount} portals`);
      }
    } catch (error) {
      console.error('[Portal Debug] Portal cleanup failed:', error);
    }
  }, { timeout: 2000 });
}

/**
 * Sets a timestamp on closed portals to track when they were closed
 * This helps with cleanup decisions
 */
export function markClosedPortals(): void {
  try {
    const newlyClosedPortals = document.querySelectorAll('[data-state="closed"]:not([data-closed-time])');
    
    if (newlyClosedPortals.length > 0) {
      console.log(`[Portal Debug] Marking ${newlyClosedPortals.length} newly closed portals`);
    }
    
    newlyClosedPortals.forEach(portal => {
      portal.setAttribute('data-closed-time', Date.now().toString());
      
      // By default, do not allow cleanup - components must explicitly opt-in
      if (!portal.hasAttribute('data-allow-cleanup')) {
        portal.setAttribute('data-allow-cleanup', 'false');
        
        // Special case: Never allow dropdown menu cleanup
        if (portal.getAttribute('data-radix-dropdown-menu-content') !== null) {
          console.log('[Portal Debug] Adding extra protection for dropdown portal');
          portal.setAttribute('data-allow-cleanup', 'false');
          portal.setAttribute('data-protected-menu', 'true');
        }
      }
    });
  } catch (error) {
    console.error('[Portal Debug] Error marking closed portals:', error);
  }
}

/**
 * Marks a portal as safe to clean up
 * @param portalOrSelector Portal element or selector to find portal
 */
export function allowPortalCleanup(portalOrSelector: Element | string): void {
  try {
    if (typeof portalOrSelector === 'string') {
      const portals = document.querySelectorAll(portalOrSelector);
      portals.forEach(portal => {
        // Special protection for dropdown menus
        if (portal.getAttribute('data-radix-dropdown-menu-content') !== null) {
          console.log('[Portal Debug] Refusing to mark dropdown for cleanup');
          return;
        }
        portal.setAttribute('data-allow-cleanup', 'true');
      });
    } else {
      // Special protection for dropdown menus
      if (portalOrSelector.getAttribute('data-radix-dropdown-menu-content') !== null) {
        console.log('[Portal Debug] Refusing to mark dropdown for cleanup');
        return;
      }
      portalOrSelector.setAttribute('data-allow-cleanup', 'true');
    }
  } catch (error) {
    console.error('[Portal Debug] Error allowing portal cleanup:', error);
  }
}

/**
 * Registers portal cleanup on component unmount
 * Should be called within a useEffect with empty dependencies
 * @returns Cleanup function for useEffect
 */
export function registerPortalCleanup(): () => void {
  return () => {
    // Mark portals as closed but don't immediately remove them
    markClosedPortals();
  };
}

/**
 * Fixes disappearing/unresponsive UI after component unmounts
 * Call this after a component with portals unmounts
 */
export function fixUIAfterPortalClose(): void {
  // Force a reflow to help the browser recalculate event handlers
  document.body.getBoundingClientRect();
  
  // Reset any invisible overlay elements that might be blocking clicks
  const overlays = document.querySelectorAll('[role="presentation"]');
  overlays.forEach(overlay => {
    if (overlay.getAttribute('data-state') === 'closed') {
      // Use type assertion to tell TypeScript this is an HTMLElement
      const htmlOverlay = overlay as HTMLElement;
      htmlOverlay.style.display = 'none';
      htmlOverlay.style.pointerEvents = 'none';
    }
  });
}
