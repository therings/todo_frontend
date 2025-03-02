# Todo Manager App

A modern, responsive Todo application built with React and Material-UI, featuring a dark mode toggle and customizable column layout.

![Todo Manager App Screenshot]

<!-- You can add a screenshot of your app here -->

## 🌟 Features

- ✨ Create, Read, Update, and Delete todos
- 🌓 Dark/Light mode toggle with persistent storage
- 📱 Responsive design for all screen sizes
- 🎯 Real-time updates with optimistic UI
- 📊 Customizable column layout (1-4 columns)
- 🔍 Modal view for detailed todo inspection
- 💾 Persistent data storage with backend API

## 🛠️ Technologies Used

### Frontend

- **React.js** - Frontend framework
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client for API requests
- **Local Storage** - For persisting user preferences

### Backend

- Backend API deployed on Vercel
- RESTful API endpoints for todo operations

## 🚀 Live Demo

[View Live Demo](https://todo-frontend-psi-ten.vercel.app/)

## 💻 Installation and Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/todo-manager.git
cd todo-manager
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory and add:

```env
REACT_APP_API_URL=<your-api-url>/todos
```

4. Start the development server

```bash
npm start
```

## 🌐 API Endpoints

The application interacts with the following API endpoints:

- `GET /todos` - Fetch all todos
- `POST /todos` - Create a new todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo
