# FoodPlanner - Recipe & Meal Planning App

## Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node.js)
- MongoDB (running locally or provide a connection string)

## 1. Backend Setup

```bash
cd backend
npm install
```

- Create a `.env` file in the `backend` folder (see `.env.example` or use the provided `.env`).
- Make sure MongoDB is running (`MONGO_URI` in `.env`).

**Start the backend server:**

```bash
npm run dev
```

The backend will run on [http://localhost:5000](http://localhost:5000).

## 2. Frontend Setup

```bash
cd frontend
npm install
```

**Start the frontend dev server:**

```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) (or as shown in your terminal).

## Usage

- Visit the frontend URL in your browser.
- Register a new account and start using the app.

## Troubleshooting

- If you get MongoDB connection errors, check your `MONGO_URI` and ensure MongoDB is running.
- If ports are in use, change them in `.env` (backend) or `vite.config.ts` (frontend).
