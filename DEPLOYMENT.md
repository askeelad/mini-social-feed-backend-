# Deployment Guide (AWS EC2)

This guide perfectly outlines how to deploy the Mini Social Feed Backend to an AWS EC2 instance.

## 1. Important Concepts: Nginx & HTTP vs HTTPS

### Do I need Nginx?

**Yes, absolutely.** While your Docker Compose file runs the API on port `3000`, it is a bad practice to expose Node.js directly to the internet. Nginx acts as a "Reverse Proxy". It safely accepts traffic on port 80 (HTTP) and 443 (HTTPS) and forwards it locally to your Docker container on port `3000`.

### Will HTTP work on the mobile app?

**No. Both iOS and Android block plain `HTTP` requests by default in production apps.**

- **iOS:** App Transport Security (ATS) blocks cleartext traffic.
- **Android:** Network Security Configuration blocks cleartext traffic.
  Therefore, your API **must** have an SSL certificate (`HTTPS://...`). We will use Nginx and a free tool called Certbot (Let's Encrypt) to get this SSL certificate.

---

## 2. Step-by-Step EC2 Deployment

### Step 1: Provision the EC2 Instance

1. Log into AWS Console and go to **EC2 > Launch Instance**.
2. Select **Ubuntu Server 22.04 LTS** (or 24.04).
3. Choose an instance type (e.g., `t3.small` or `t3.medium` because running PostgreSQL, Redis, and Node inside Docker uses memory).
4. Create and download a `.pem` Key Pair so you can SSH into the server.
5. In **Network Settings**, check the boxes to **Allow HTTP traffic** and **Allow HTTPS traffic**.
6. Launch the instance.
7. Go to **Elastic IPs**, allocate a new Elastic IP, and associate it with your new EC2 instance so the IP address never changes.

### Step 2: Point a Domain Name to the IP

1. Go to your domain registrar (GoDaddy, Namecheap, Route53, etc.).
2. Create an **A Record** (e.g., `api.yourdomain.com`) pointing to the **Elastic IP** of your EC2 instance.

### Step 3: Connect and Install Dependencies

Open your terminal and SSH into the server:

```bash
ssh -i /path/to/your-key.pem ubuntu@<your-elastic-ip>
```

Once inside, install Docker and Nginx:

```bash
sudo apt update
sudo apt install docker.io docker-compose nginx python3-certbot-nginx -y
```

### Step 4: Clone the Code and Run Docker

Still inside the EC2 server:

1. Clone your git repository or copy the `backend` folder via SCP.
2. Create your production `.env` file (ensure you include all the secure Firebase details and a strong JWT secret).
   ```bash
   cd backend
   nano .env
   ```
3. Start the entire backend using Docker Compose in detached mode:
   ```bash
   sudo docker-compose -f docker-compose.dev.yml up -d --build
   ```
   _(Note: For an actual production setup, you should create a `docker-compose.prod.yml` that removes `adminer` and uses persistent volume paths on the host, but the `.dev.yml` will work to get it running immediately)._

### Step 5: Configure Nginx

Nginx will route traffic from your domain to the Docker container.

1. Create a new Nginx config file:
   ```bash
   sudo nano /etc/nginx/sites-available/socialfeed
   ```
2. Paste this configuration (replace `api.yourdomain.com` with your actual domain):

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/socialfeed /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

### Step 6: Add SSL (HTTPS) with Certbot

Now that HTTP routes to your backend, secure it with HTTPS so the mobile app will allow the connection.
Run Certbot:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

Certbot will ask for your email and then automatically rewrite your Nginx configuration to include the SSL certificates.

### Step 7: Update the Mobile App

Finally, go back to your local laptop, open your React Native App's `.env` file, and change the API URL:

```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

Now, when you build the final APK via Expo (`npx eas-cli build -p android --profile preview`), it will communicate securely over HTTPS with your AWS EC2 server!
