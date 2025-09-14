# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Toodooist is a beautiful post-it note management application built with React + Vite. Users can create, organize, and delete colorful post-it notes with drag-and-drop functionality.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy       # Deploy to GitHub Pages
```

## Architecture

### Project Structure
```
src/
├── App.jsx          # Main component with all functionality
├── main.jsx         # React app entry point
└── assets/          # Static assets

styles.css           # Global styles
index.html          # HTML template
vite.config.js      # Vite configuration
```

### Key Features
- **Post-it Management**: Create, display, and delete colorful post-it notes
- **Drag-to-Delete**: Drag posts right to delete with visual feedback
- **Form Validation**: 40-character limit with real-time counter
- **Persistent Storage**: localStorage for data persistence
- **Responsive Design**: Works on desktop and mobile devices

### Data Model
```javascript
{
  id: timestamp + random,
  description: string (max 40 chars),
  date: ISO string | null,
  color: hex string,
  createdAt: ISO string
}
```

### Styling
- Custom CSS with CSS variables for theming
- 7 predefined pastel colors for post-its
- "Satisfy" Google Font for elegant typography
- Responsive grid layout with hover effects

## Technical Details

- **React 19** with functional components and hooks
- **Vite** for fast development and building
- **ESLint** with React-specific rules
- **Custom drag system** supporting mouse and touch
- **Modal system** with backdrop/ESC key closing
- **Character counting** with live feedback