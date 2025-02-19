
# Features & Improvements Tracking

This file tracks potential improvements and features that could be implemented in the project.

## Pending Improvements

### Regeneration System
- [ ] Refactor `use-sculpture-regeneration.ts` into smaller, more focused hooks (current file is over 200 lines)
- [ ] Add loading states and better error handling for regeneration processes
- [ ] Add confirmation dialog before regeneration to prevent accidental triggers
- [ ] Implement retry logic for failed regenerations
- [ ] Add progress indicators for multi-step regeneration processes
- [ ] Improve visual feedback during regeneration states

## Implemented Features
*(Most recently implemented at the top)*

- [x] Fix React queue error in useToast hook

## How to Use This List

When working with the AI assistant:
1. To view the list: Ask to "show the FEATURES.md file"
2. To add items: Ask to "add X to FEATURES.md"
3. To implement: Ask to implement any specific item from the list

## Notes

- This list is maintained across conversations through the codebase
- Items are moved to "Implemented Features" section once completed
- Each item should be specific and actionable

