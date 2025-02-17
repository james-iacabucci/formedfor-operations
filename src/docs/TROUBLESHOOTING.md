
# Troubleshooting Guide

## UI Interaction Issues

### Settings Sheet Portal Cleanup
**Issue**: After closing the Settings sheet, the UI becomes unresponsive/uninteractable.

**Solution**: Implement targeted portal cleanup in the Settings sheet component when it closes.

```typescript
// In SettingsSheet.tsx, add this cleanup code to the useEffect that runs when sheet closes:
useEffect(() => {
  if (!open) {
    setTimeout(() => {
      try {
        const portals = document.querySelectorAll('[data-state="closed"]');
        portals.forEach(portal => {
          // Only target Settings-related portals
          if (portal.textContent?.includes('Settings')) {
            portal.parentNode?.removeChild(portal);
          }
        });
      } catch (error) {
        console.error('Portal cleanup error:', error);
      }
    }, 300); // Wait for animation to complete
  }
}, [open]);
```

**Key Points**:
1. The issue occurs because Radix UI portals sometimes don't clean up properly
2. Solution must be targeted to avoid interfering with other components
3. Only remove portals that:
   - Are in a "closed" state
   - Contain "Settings" text content
4. Include error handling for removeChild operation
5. Wait for animations (300ms) before cleanup

**Warning**: Don't implement generic portal cleanup as it can affect other components. Always target specific content.

