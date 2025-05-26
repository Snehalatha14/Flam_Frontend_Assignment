# Custom Event Calendar

## Overview
This project is a dynamic, interactive **Custom Event Calendar** built with React.js. It allows users to manage their schedules effectively by adding, editing, deleting, and viewing events on a traditional monthly calendar view. The calendar supports complex features like recurring events, drag-and-drop rescheduling, event conflict management, and data persistence using local storage.

---

## Features

- 📅 Monthly calendar view with navigation
- 📝 Add, edit, and delete events
- 🔁 Recurring event support (Daily, Weekly, Monthly, Custom)
- 🧲 Drag-and-drop to reschedule events
- ⚠️ Event conflict detection and handling
- 💾 Event persistence with local storage

---

## Technologies Used

- **React.js** – Frontend framework
- **date-fns** – Lightweight date handling library
- **React DnD** – Drag-and-drop functionality
- **CSS Modules / Styled Components** – For styling

---

## Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/custom-event-calendar.git
   cd custom-event-calendar
 ---
 
2. **Install dependencies:**
   ```bash
   npm install react react-dom react-scripts
   npm install date-fns
   npm install react-dnd react-dnd-html5-backend
  or **simply run:**
  ```bash
  npm install
 
 ---

3. **Run the development server:**
  ```bash
  npm start
 
 ---

4. **Open the app:**
   Open http://localhost:3000 in your browser to view the calendar.
5. **Usage:**
    Navigate through months using the arrow buttons.
    Click on any date to add a new event.
    Fill in the event form with title, time, description, recurrence, and optional color.
    Click on an event to edit or delete it.
    Drag and drop events to reschedule.
    Events are automatically saved and loaded from your browser’s local storage.
6. Live Demo - Vercel link:
   🔗 View the deployed project here:
   https://your-project-name.vercel.app

