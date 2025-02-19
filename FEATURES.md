
# Features & Improvements Tracking

This file tracks potential improvements and features that could be implemented in the project.

## Pending Improvements

### User Management System
- [ ] Add comprehensive user roles system (admin, manager, user, etc.)
- [ ] Implement role-based permissions management
- [ ] Create admin interface for user management
- [ ] Add user activity logging and audit trails

### Project Management
- [ ] Implement client projects system
  - [ ] Add project metadata (location, client info, trade contact)
  - [ ] Enable adding sculptures from library
  - [ ] Implement smart copy system for library items
  - [ ] Add branching logic for project-specific variants vs library variants
  - [ ] Add project status tracking
  - [ ] Create project dashboard

### Sculpture Features
- [ ] Enhance variant generation system
  - [ ] Generate multiple variants simultaneously (grid of 10)
  - [ ] Add batch selection interface
  - [ ] Implement bulk save functionality
  - [ ] Add regenerate all capability
- [ ] Add 3D model preview functionality
- [ ] Implement PDF export system
  - [ ] Sales presentation format
  - [ ] Marketing collateral format
  - [ ] Technical specifications format

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


