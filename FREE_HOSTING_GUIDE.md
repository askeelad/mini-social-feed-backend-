# Free Remote Hosting Guide (Neon + Render)

To make your React Native app accessible to recruiters anywhere in the world, we will host the backend 100% for free using modern cloud platforms.

---

## 🟢 Step 1: Host PostgreSQL on Neon.tech

Neon provides free, serverless PostgreSQL with zero setup.

1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Click **Create Project**, name it `socialfeed`, and select **Postgres version 16**.
3. Once the database is created, look for the **Connection Details** section on your dashboard.
4. Copy the connection string. It will look exactly like this:
   `postgresql://db_owner:xxxxx@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. _Save this connection string. You will need it later!_

---

## 🔴 Step 2: Host Redis on Upstash

Because Render's free tier doesn't include Redis, we will use Upstash for free Serverless Redis.

1. Go to [Upstash.com](https://upstash.com/) and sign up.
2. Click **Create Database** under the Redis section.
3. Keep the default settings (Global database) and deploy.
4. Scroll down to the **Node.js** connection panel and copy the `UPSTASH_REDIS_REST_URL` or standard Redis URL.
   _E.g. `rediss://default:xxxxx@mighty-lion-33423.upstash.io:33423`_
5. _Save this connection string!_

---

## 🟣 Step 3: Publish your Code to GitHub

Render needs a public (or private) GitHub repository to build your API.

1. Go to [GitHub](https://github.com/) and create a new repository (e.g., `mini-social-feed-backend`).
2. Open your terminal in the `backend/` folder and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial backend commit"
   git branch -M main
   git remote add origin https://github.com/your-username/mini-social-feed-backend.git
   git push -u origin main
   ```

---

## ⚪ Step 4: Host the Node.js API on Render

Render will pull your code from GitHub and run it just like you do on your laptop.

1. Go to [Render.com](https://render.com/) and sign up.
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub account.
4. Select the `mini-social-feed-backend` repository.
5. Fill out the form:
   - **Name:** `socialfeed-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`

6. Scroll down to **Environment Variables** and add everything from your `.env`:
   - `PORT` = `3000`
   - `NODE_ENV` = `production`
   - `DB_URL` = _(Paste the Neon.tech URL from Step 1)_
   - `REDIS_URL` = _(Paste the Upstash URL from Step 2)_
   - `JWT_SECRET` = `your-super-secret-jwt-key-change-this`
   - `JWT_REFRESH_SECRET` = `your-super-secret-jwt-refresh-key-change`
   - `FIREBASE_PROJECT_ID` = _(From your google-services.json)_
   - `FIREBASE_PRIVATE_KEY` = _(Make sure to include the `\n` characters)_
   - `FIREBASE_CLIENT_EMAIL` = _(From your google-services.json)_

7. Click **Create Web Service**.
8. Render will now download your code, run `npm run build`, and start the app! Wait 3-5 minutes until you see the green `Live` badge.
9. **Important:** Copy your Render URL (e.g., `https://socialfeed-api-xyz.onrender.com`).

---

## 🟡 Step 5: Migrate the Neon Database

Your backend is running, but the Neon database has no tables yet!
To create the tables in Neon, run the migration script from your local laptop:

1. Open `.env` in your `backend/` folder.
2. Change the `DB_URL` to your Neon Connection String.
3. In your terminal, run: `npm run migration:run`
4. _(Your laptop just connected to the cloud Neon database and created the tables!)_

---

## 📱 Step 6: Update the React Native App

Now that your API is live on the internet, point the mobile app to it!

1. In your `react-native-app/` folder, open `.env`.
2. Change the API URL to your Render domain:
   ```bash
   EXPO_PUBLIC_API_URL=https://socialfeed-api-xyz.onrender.com/api/v1
   ```
3. Ensure Firebase has been added into `app.json` (as detailed in README.md).
4. Run the EAS Build to generate the final APK for the recruiter!
   ```bash
   npx eas-cli build -p android --profile preview --local
   ```
