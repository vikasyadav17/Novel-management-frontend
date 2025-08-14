# Novel Library

A web application for managing and browsing a collection of novels.  
Built with React (Vite) for the frontend and expects a RESTful backend.

## Features

- Add new novels with details (name, original name, link, genre, etc.)
- Browse all novels in a responsive grid
- View all novels on a dedicated Library page
- Modern UI with form validation and navigation

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/vikasyadav17/Novel-management-frontend.git
   cd Novel-management-frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend

This frontend expects a backend running at `http://localhost:8080/novels`.  
Make sure your backend API is running and accessible.

## Project Structure

- `src/components/` – React components (NovelCard, NovelForm, etc.)
- `src/pages/` – Page components (Library)
- `src/services/` – API service for backend communication
- `src/App.jsx` – Main application and routing
- `src/App.css` – Styles

## Customization

- Update API endpoints in `src/services/novelApi.js` if your backend URL changes.
- Modify styles in `src/App.css` for custom look and feel.

## License
