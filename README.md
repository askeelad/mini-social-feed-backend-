# Mini Social Feed App - Backend

A scalable Node.js/Express API built with TypeScript for a social feed application.

## Architecture Overview

The backend is built following a structured, layered architecture to ensure maintainability and separation of concerns:

- **Controllers** (`src/modules/*/`): Handle incoming requests, extract parameters, and return responses.
- **Services** (`src/modules/*/`): Contain the core business logic.
- **Repositories** (`src/modules/*/`): Handle all database interactions (TypeORM).
- **Middlewares** (`src/middlewares/`): Handle authentication, validation (Zod), and error processing.
- **Database**: PostgreSQL for persistent data, Redis for token caching and blacklisting.

Key Features:

- **Authentication**: JWT-based login/signup with Refresh Token rotation managed by Redis.
- **Pagination**: Numbered pagination for fetching large lists of posts, comments, and notifications.
- **Real-time Push**: Firebase Admin SDK integrated to send background FCM push notifications on likes and comments.

## Running with Docker (Recommended)

The easiest way to get the entire backend running is using Docker Compose. This will automatically spin up the API, PostgreSQL database, Redis instance, and Adminer (a database GUI).

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Setup Instructions

1. **Environment Variables**
   Create a `.env` file in the root of the `backend` folder based on the example:

   ```bash
   cp .env.example .env
   ```

   **Important**: To enable Push Notifications, you must fill out the `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_CLIENT_EMAIL` variables using your Firebase Service Account JSON credentials.

2. **Start the Containers**
   Run the following command in the `backend` folder:

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. **Database Migrations**
   Once the containers are running, you need to create the database tables. Open a _new_ terminal window, navigate to the `backend` folder, and run:
   ```bash
   docker exec -it mini-social-feed-api npm run migration:run
   ```

### Services Available

- **Backend API**: `http://localhost:3000`
- **Adminer (Database GUI)**: `http://localhost:8080`
  - _System_: PostgreSQL
  - _Server_: `postgres`
  - _Username_: `postgres`
  - _Password_: `postgres`
  - _Database_: `techzu_db`
- **Swagger API Docs**: `http://localhost:3000/api/v1/docs`

## 📖 API Documentation (Swagger)

The backend includes auto-generated Swagger documentation that allows you to explore and test the API endpoints directly from your browser.

1. Start the server (via Docker or locally).
2. Visit: [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

**Note:** The Swagger setup is documented in the codebase as the final step. To hit secure endpoints in Swagger, you must first use the `/auth/login` endpoint to get an `accessToken`, then paste it into the "Authorize" button at the top of the Swagger UI.

## Running Locally (Without Docker)

If you prefer to run the Node.js app directly on your host machine:

1. Ensure you have PostgreSQL and Redis running locally.
2. Update your `.env` file to point to your `localhost` DB/Redis URLs instead of the Docker container names.
3. Install dependencies: `npm install`
4. Run migrations: `npm run migration:run`
5. Start the development server: `npm run dev`
