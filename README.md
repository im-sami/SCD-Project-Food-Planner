# FoodPlanner - Recipe & Meal Planning App

## Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node.js)
- MongoDB (running locally or provide a connection string)
- **Optional:** Docker

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

## Docker Usage (Optional)

You can run the backend and frontend using Docker containers individually.

### Backend

1. Build the backend image (if not using a prebuilt image):

   ```bash
   docker build -t your-backend-image-name ./app/backend
   ```

2. Run MongoDB (if not already running):

   ```bash
   docker run -d --name foodplanner-mongo -p 27017:27017 mongo:6
   ```

3. Run the backend container:

   ```bash
   docker run -d --name foodplanner-backend --env-file ./app/backend/.env -p 5000:5000 --link foodplanner-mongo:mongo your-backend-image-name
   ```

   - Make sure your `MONGO_URI` in `.env` is set to `mongodb://mongo:27017/recipe-planner` for Docker networking.

### Frontend

1. Build the frontend image (if not using a prebuilt image):

   ```bash
   docker build -t your-frontend-image-name ./app/frontend
   ```

2. Run the frontend container:

   ```bash
   docker run -d --name foodplanner-frontend -p 5173:80 your-frontend-image-name
   ```

   - The frontend will be available at [http://localhost:5173](http://localhost:5173).

## Usage

- Visit the frontend URL in your browser.
- Register a new account and start using the app.

## Troubleshooting

- If you get MongoDB connection errors, check your `MONGO_URI` and ensure MongoDB is running.
- If ports are in use, change them in `.env` (backend) or `vite.config.ts` (frontend).
- For Docker, ensure your containers are running and environment variables are set correctly.
