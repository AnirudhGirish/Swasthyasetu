# 🏥 SwasthyaSetu

**SwasthyaSetu** is an AI-powered, real-time health infrastructure monitoring platform built to bridge the gap between patients, hospitals, and health authorities. It enables seamless reporting, analysis, and forecasting of hospital resource usage, with geolocation-based dashboards for patients and role-based access control for different stakeholders.

---

## 🚀 Features

### 🔒 Role-Based Login (Google OAuth)
- **Patients** can sign up and access services directly.
- **Hospitals** can log in only if pre-approved by the Health Department.
- **Health Department Admins** manage hospitals and city-wide analytics.

### 🧑‍⚕️ Patient Dashboard
- Geolocation-based or manually selected location (Country → State → City).
- Emergency Services panel with one-tap call access to Ambulance, Police, Fire.
- AI-powered symptom checker using OpenAI API.
- View nearby hospitals with real-time ICU and oxygen availability.

### 🏨 Hospital Dashboard
- Submit daily resource data: beds, ICU, oxygen units, dialysis, doctors.
- View trends and analytics of past submissions.
- Paginated record history with full CSV export.
- AI-powered insights for hospital-specific demand forecasting.

### 🏛️ Health Department Dashboard
- City-wide resource overview and hospital submission statistics.
- Alerts for missing updates and abnormal trends.
- Add and manage registered hospitals.
- AI-powered forecast and trend analytics for ICU/Oxygen demand.
- Complete submission and hospital data export (CSV).

---

## 🧱 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Auth**: Google Sign-In via [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Chart.js](https://www.chartjs.org/) or similar (for trend visualization)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **API**: Supabase Edge Functions & REST APIs
- **AI Integration**: [OpenAI API](https://platform.openai.com/) for:
  - Symptom interpretation
  - Forecasting trends
  - Alert generation

---

## 🧠 AI Capabilities

- **Symptom Analysis**: Interprets natural language input from patients and provides medical insights.
- **Forecasting**: Predicts ICU and oxygen demand based on historical data.
- **Alert System**: Flags cities or hospitals with abnormal trends or missed updates.

---

## 🛡️ Security & Access Control

- 🔐 **Google OAuth** for authentication.
- 🛡️ **Supabase RLS (Row-Level Security)** for secure, scoped data access.
- 🚫 **No hospital self-registration** – only health departments can onboard hospitals.

---

## 🗂️ Data Model Highlights

### Profiles Table
Stores basic user info and role (`PATIENT`, `HOSPITAL`, `ADMIN`).

### Hospitals Table
Each hospital is linked to a department admin and a registered Gmail ID.

### Resources Table
Daily resource usage and availability data submitted by hospitals:
- ICU Beds (used & total)
- Normal Beds (used & total)
- Oxygen Units (used & total)
- Dialysis Machines (used & total)
- Doctors (available & total)

---

## ✅ Setup & Run Locally

1. **Clone the repo**  
   ```bash
        git clone https://github.com/your-username/swasthya-setu.git
        cd swasthya-setu
   ```

2. **Install Dependencies**
    ```bash
        npm install
    ```

3. **Configure environment**
    
    Create a `.env` file with 
    ```bash
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
        NEXTAUTH_SECRET=your-secret
        NEXTAUTH_URL=http://localhost:3000
        GOOGLE_CLIENT_ID=your-google-client-id
        GOOGLE_CLIENT_SECRET=your-google-client-secret
        OPENAI_API_KEY=your-openai-api-key
    ```

4. **Run the dev server**
    ```bash
        npm run dev
    ```

## 📦 Project Structure

/app
  /dashboard
    /patient
    /hospital
    /admin
  /setup
/lib
  /geolocation
  /openai
  /supabase
/components
/types

## 📊 Roadmap

    •	Role-based login
	•	Patient dashboard with symptom AI and hospital listings
	•	Hospital dashboard with resource submission
	•	Admin dashboard with city-level analytics and alerts
	•	Mobile-optimized UI
	•	Email alerts for hospitals not submitting data
	•	Historical trend comparison across cities

## 👨‍💻 Author

Made with ❤️ by Swasthya Setu

Connect: anirudhgirish08@gmail.com