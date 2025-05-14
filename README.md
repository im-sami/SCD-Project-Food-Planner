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

### API Proxying with Nginx

The frontend Docker image uses Nginx to serve the static files and proxy API requests to the backend. The configuration is specified in `nginx.conf`:

- Static files are served from `/usr/share/nginx/html`
- API requests to `/api/*` are proxied to the backend service
- This allows the frontend to make API calls without CORS issues

```nginx
# Key parts of nginx.conf
location /api {
    proxy_pass http://recipe-planner-backend-service:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Kubernetes Deployment

Kubernetes manifests (YAML files) for MongoDB, backend and frontend are provided in the project root:

- `deployment-mongo.yaml` / `service-mongo.yaml` - MongoDB database deployment and service
- `deployment-backend.yaml` / `service-backend.yaml` - Backend API deployment and service
- `deployment-frontend.yaml` / `service-frontend.yaml` - Frontend web app deployment and service

**To deploy:**

1. Ensure your Kubernetes cluster is running and `kubectl` is configured.
2. Create necessary environment variables as Kubernetes secrets:

   ```bash
   kubectl create secret generic backend-env -n food-planner \
     --from-literal=PORT=5000 \
     --from-literal=MONGO_URI=mongodb://mongo:27017/recipe-planner \
     --from-literal=JWT_SECRET=your_jwt_secret \
     --from-literal=CORS_ORIGIN="*"
   ```

3. Deploy MongoDB first:

   ```bash
   kubectl apply -f deployment-mongo.yaml -n food-planner
   kubectl apply -f service-mongo.yaml -n food-planner
   ```

4. Deploy the backend (make sure to wait until MongoDB is running):

   ```bash
   kubectl apply -f deployment-backend.yaml -n food-planner
   kubectl apply -f service-backend.yaml -n food-planner
   ```

5. Finally, deploy the frontend:

   ```bash
   kubectl apply -f deployment-frontend.yaml -n food-planner
   kubectl apply -f service-frontend.yaml -n food-planner
   ```

6. Access the frontend via the NodePort shown in `service-frontend.yaml` (default: `30008`).

### Accessing the Frontend Service

To access your deployed frontend, use:

```bash
minikube service recipe-planner-frontend-service -n food-planner
```

This will open the service in your browser with the correct port forwarding.

### Resetting and Redeploying

If you encounter issues with your Kubernetes deployment, you have two options:

#### Option 1: Quick Reset (Recommended)

Delete all resources in a namespace at once:

```bash
# Delete everything in the namespace
kubectl delete all --all -n food-planner
kubectl delete secret backend-env -n food-planner
```

This will delete all deployments, services, pods, and other resources in that namespace.

#### Option 2: Step-by-Step Reset

For more control, you can delete resources individually:

```bash
# Delete deployments
kubectl delete deployment recipe-planner-frontend -n food-planner
kubectl delete deployment recipe-planner-backend -n food-planner
kubectl delete deployment mongo -n food-planner

# Delete services
kubectl delete service recipe-planner-frontend-service -n food-planner
kubectl delete service recipe-planner-backend-service -n food-planner
kubectl delete service mongo -n food-planner

# Delete secrets
kubectl delete secret backend-env -n food-planner
```

#### Redeploying After Reset

1. Create the backend environment secret:

```yaml
# Save this as backend-env-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-env
  namespace: food-planner
type: Opaque
stringData:
  PORT: "5000"
  MONGO_URI: "mongodb://mongo:27017/recipe-planner"
  JWT_SECRET: "your_jwt_secret"
  CORS_ORIGIN: "*"
```

2. Rebuild and push Docker images (if necessary):

```bash
# Rebuild frontend with updated config files
cd app/frontend
docker build -t samiscd/recipe-planner-mern-frontend:latest .
docker push samiscd/recipe-planner-mern-frontend:latest

# Rebuild backend if needed
cd ../../app/backend
docker build -t samiscd/recipe-planner-mern-backend:latest .
docker push samiscd/recipe-planner-mern-backend:latest
```

3. Apply resources in the correct order:

```bash
# First, create the secret for backend environment variables
kubectl apply -f backend-env-secret.yaml -n food-planner

# Next, deploy MongoDB
kubectl apply -f deployment-mongo.yaml -n food-planner
kubectl apply -f service-mongo.yaml -n food-planner

# Wait for MongoDB to be running
kubectl wait --for=condition=ready pod -l app=mongo -n food-planner --timeout=120s

# Then deploy the backend
kubectl apply -f deployment-backend.yaml -n food-planner
kubectl apply -f service-backend.yaml -n food-planner

# Wait for backend to be running
kubectl wait --for=condition=ready pod -l app=recipe-planner-backend -n food-planner --timeout=120s

# Finally, deploy the frontend
kubectl apply -f deployment-frontend.yaml -n food-planner
kubectl apply -f service-frontend.yaml -n food-planner
```

4. Verify everything is running properly:

```bash
# Check all resources
kubectl get all -n food-planner

# Check specific pod logs
kubectl logs -l app=recipe-planner-backend -n food-planner
kubectl logs -l app=recipe-planner-frontend -n food-planner
```

**Notes on Kubernetes YAML files:**

- The `deployment-mongo.yaml` creates a MongoDB instance with an emptyDir volume
- The `deployment-backend.yaml` references the `backend-env` secret for environment variables
- The `deployment-frontend.yaml` sets the `VITE_API_URL` to connect to the backend service
- The services use explicit namespaces to avoid deployment issues

## GitHub Actions Setup

### Setting Up a Self-Hosted Runner

1. Go to your GitHub repository > Settings > Actions > Runners
2. Click "New self-hosted runner"
3. Select your operating system (Windows) and architecture (x64)
4. Follow the instructions to download and configure the runner

**Recommended runner installation location:**

```bash
# Create a dedicated folder for the runner (NOT inside your project directory)
mkdir C:\actions-runner
cd C:\actions-runner

# Download the runner package (use the URL from GitHub)
# Extract and configure as per GitHub instructions
```

When configured properly, the self-hosted runner will:

1. Monitor your GitHub repository for workflow triggers
2. Automatically check out your code to a temporary workspace when a workflow runs
3. Execute the workflow steps in that temporary workspace
4. Clean up the workspace after completion

The runner service runs independently from your project directory and doesn't need to be in the same location as your code.

## Usage

- Visit the frontend URL in your browser.
- Register a new account and start using the app.

## Troubleshooting

- If you get MongoDB connection errors, check your `MONGO_URI` and ensure MongoDB is running.
- If ports are in use, change them in `.env` (backend) or `vite.config.ts` (frontend).
- For Docker, ensure your containers are running and environment variables are set correctly.
- For Kubernetes deployments:
  - If NodePorts are already allocated, delete the existing services first with:
    ```bash
    kubectl delete service recipe-planner-backend-service -n food-planner
    kubectl delete service recipe-planner-frontend-service -n food-planner
    ```
  - If backend pods show `CreateContainerConfigError`, ensure the `backend-env` secret exists
  - Check pod status with `kubectl get pods -n food-planner`
  - Check logs with `kubectl logs -l app=recipe-planner-backend -n food-planner`
  - If you need to check which namespace a service is in, use `kubectl get services --all-namespaces`
  - If the frontend can't connect to the backend, ensure your nginx.conf is correctly set up and the frontend is using the right API URL
