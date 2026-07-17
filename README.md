# AirGuard AI - Global Urban Air Quality Dashboard

AirGuard AI is a comprehensive, AI-driven full-stack application that provides real-time air quality monitoring, predictive analytics using machine learning, dynamic PDF reporting, and an administrative dashboard.

## Table of Contents
1. [Prerequisites & Setup](#prerequisites--setup)
   - [Python Setup](#python-setup)
   - [MongoDB Setup](#mongodb-setup)
   - [OpenWeather Setup](#openweather-setup)
   - [VS Code Setup](#vs-code-setup)
2. [Environment Variables](#environment-variables)
3. [Running the Application](#running-the-application)
4. [Testing Guide](#testing-guide)
5. [Postman Collection](#postman-collection)
6. [Deployment Guide](#deployment-guide)
   - [MongoDB Atlas](#mongodb-atlas)
   - [Backend: Render / Railway](#backend-render--railway)
   - [Frontend: Vercel](#frontend-vercel)

---

## Prerequisites & Setup

### Python Setup
1. Install [Python 3.10+](https://www.python.org/downloads/).
2. Open your terminal and navigate to the `backend` directory.
3. Create a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### MongoDB Setup
1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a new Cluster (the free tier works perfectly).
3. Under **Database Access**, create a user with a secure password.
4. Under **Network Access**, whitelist your IP address (or `0.0.0.0/0` for access anywhere).
5. Click **Connect**, select **Connect your application**, and copy the connection string.

### OpenWeather Setup
1. Sign up at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).
2. Navigate to your **API Keys** tab.
3. Generate a new API Key.
4. You will need this key to fetch live geocoding, air pollution, and meteorological data.

### VS Code Setup
1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Recommended Extensions:
   - **Python** (`ms-python.python`)
   - **Live Server** (`ritwickdey.LiveServer`) - *Crucial for running the frontend*
   - **Prettier** (`esbenp.prettier-vscode`)
   - **MongoDB for VS Code** (`mongodb.mongodb-vscode`)
3. Set your VS Code interpreter to the `venv` created in the Python Setup step.

---

## Environment Variables

Copy the provided `.env.example` file to `.env` inside the `backend` directory (and the root if necessary) and update the placeholders:

```bash
cp .env.example .env
```

Ensure `MONGO_URI`, `JWT_SECRET_KEY`, and `OPENWEATHER_API_KEY` are populated correctly before starting the application.

---

## Running the Application

### 1. Start the Backend
```bash
cd backend
python app.py
```
The Flask API will run on `http://localhost:5000`.

### 2. Start the Frontend
Open the `frontend` folder in VS Code, right-click `index.html`, and select **Open with Live Server**. The UI will run natively on `http://127.0.0.1:5500`.

---

## Testing Guide

### Manual Verification
1. **Authentication**: Register a user via `signup.html`. Verify the user object is created in the MongoDB `users` collection.
2. **RBAC Validation**: Register an email containing "admin" to trigger Admin rights (based on our mock validation script). Attempt accessing `admin.html`. Standard users will be blocked.
3. **API Logic & Search**: Search for "London" in `prediction.html`. Verify that the OpenWeather API responds, the custom loaders toggle correctly, and data is saved to the `live_measurements` collection.
4. **PDF Reports & Alerts**: If a hazardous city is queried (AQI 4 or 5), the Red Alert Modal will trigger and an email will be simulated. Click "Generate Full PDF Report" to download the `reportlab` output.

---

## Postman Collection

A complete Postman collection is included in the root directory: `postman_collection.json`.
1. Open Postman.
2. Click **Import** and select the `postman_collection.json` file.
3. Configure your Environment Variables in Postman to set `{{base_url}}` to `http://localhost:5000`.
4. Run the Authentication endpoints first to grab the JWT token and set it as a Bearer Token for the subsequent requests.

---

## Deployment Guide

This project features a decoupled architecture, meaning the Frontend and Backend should be deployed separately.

### MongoDB Atlas
Your database is already hosted in the cloud. Ensure your Network Access allows IPs from your deployment platforms (Render/Railway/Vercel) by using the `0.0.0.0/0` whitelist option.

### Backend: Render
1. Push your repository to GitHub.
2. Create an account on [Render](https://render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repo.
5. Set the **Root Directory** to `backend`.
6. Environment: `Python`
7. Build Command: `pip install -r requirements.txt`
8. Start Command: `gunicorn app:app`
9. Add all variables from your `.env` file into the Render Environment Variables section.
10. Deploy.

### Backend Alternative: Railway
1. Sign up on [Railway.app](https://railway.app/).
2. Create a new project -> **Deploy from GitHub repo**.
3. Railway automatically detects Python.
4. Ensure you set your Root Directory to `backend` in the settings if it isn't auto-detected.
5. Add your Environment Variables.
6. The platform will automatically build using `requirements.txt` and run `gunicorn`.

### Frontend: Vercel
1. Sign up on [Vercel](https://vercel.com/).
2. Click **Add New Project**.
3. Import your GitHub repository.
4. **IMPORTANT**: Change the **Root Directory** to `frontend`.
5. Framework Preset: `Other`.
6. Build Command: Leave blank (Static HTML/JS/CSS).
7. *Crucial Pre-Deployment Step*: In your frontend JS files (`weather.js`, `auth.js`, etc.), you must update the `http://localhost:5000` URLs to point to your live Render/Railway URL generated in the previous step.
8. Click **Deploy**.

---
*Developed as part of the AirGuard AI Platform Initiative.*
