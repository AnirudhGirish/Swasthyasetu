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
## Highlights
- **Patients** Location-aware dashboard with emergency dialer, AI symptom triage, and real-time bed/ICU/oxygen availability for nearby hospitals.
- **Hospitals** Supabase Google OAuth onboarding, guided profile setup, validated daily resource submissions, and CSV export of historical reports.
- **Health departments** Manage hospital access, monitor submission compliance, export resources, and track trends with city-wide analytics.
- **AI copilots** OpenAI-backed endpoints deliver symptom diagnosis, demand forecasts, anomaly detection, and narrative summaries tailored to hospital data.
- **Public portal** Read-only landing experience shares emergency contacts and the curated hospital list via the `public_hospitals` view.
- **Modern web stack** Next.js 15 (App Router + Turbopack), React 19, Tailwind CSS 4, Recharts, and Supabase SSR client keep the experience fast and type-safe.

---

## 🧱 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Auth**: Google Sign-In via [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Chart.js](https://www.chartjs.org/) (for trend visualization)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **API**: Supabase Edge Functions & REST APIs
- **AI Integration**: [OpenAI API](https://platform.openai.com/) for:
  - Symptom interpretation
  - Forecasting trends
  - Alert generation

---
## Available scripts
- `npm run dev` – start Next.js with Turbopack.
- `npm run build` – create a production build.
- `npm start` – serve the production build.
- `npm run lint` – run ESLint with the Next.js config.

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
## Supabase schema
- **profiles** (`id uuid`, `email text`, `full_name text`, `role text`) – maps Supabase auth users to application roles (`PATIENT`, `HOSPITAL`, `HEALTH_DEPT`).
- **authorized_hospitals** (`id`, `name`, `email`, `location`, `added_by`) – whitelist of hospital Gmail IDs the health department approves.
- **hospitals** (`id`, `name`, `location`, `address`, `city`, `state`, `country`, `postal_code`, `speciality_type`, `specialities[]`, `department_id`) – onboarding record created after authorized hospitals complete setup.
- **resources** (`id`, `hospital_id`, `date`, `beds_*`, `icu_*`, `oxygen_*`, `dialysis_*`, `doctors_*`, `patients_*`, `male_patients`, `female_patients`, `er_visits`, `ot_usage`, `common_symptoms[]`, `weekly_diagnosis_summary`, `doctors_by_speciality jsonb`, `nurses_count`, `staff_to_patient_ratio`) – daily hospital submissions.
- **public_hospitals** (view) – exposes a minimal `name` + `location` projection for the citizen portal.
- Enable Row Level Security and write policies so:
  - patients can read the public view only;
  - hospitals can insert/update their own `resources` rows;
  - health department admins can manage hospital registries.
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
## Project structure
```text
src/
  app/
    api/                # OpenAI-backed API endpoints
    auth/               # Supabase OAuth callback flow
    dashboard/          # Patient, hospital, admin dashboards
    login/              # Public login screen
    publics/            # Citizen-facing hospital listing
    setup/              # Hospital onboarding wizard
  components/           # Shared UI building blocks
lib/
  ai/                   # Client helpers for AI endpoints
  auth/                 # Role utilities
  geolocation/          # Location detection + fallback
  supabase/             # Supabase client + helpers
```
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


## 📊 Roadmap

    •	Role-based login
	•	Patient dashboard with symptom AI and hospital listings
	•	Hospital dashboard with resource submission
	•	Admin dashboard with city-level analytics and alerts
	•	Mobile-optimized UI
	•	Email alerts for hospitals not submitting data
	•	Historical trend comparison across cities

## Development notes
- The location selector tries browser geolocation first and falls back to manual selection using `country-state-city`; network access to Nominatim reverse geocoding is required for auto-detect.
- AI endpoints rely on OpenAI rate limits—add caching or retries before production.
- Hospital submissions enforce simple client-side validation; consider duplicating the checks with database constraints.
- CSV exports use in-browser blobs (`file-saver`); verify download permissions when embedding inside other shells.

## Disclaimer
AI-generated guidance is informational only and must not replace professional medical advice. Always consult qualified healthcare providers before acting on the insights.


## 👨‍💻 Author

Made with ❤️ by Swasthya Setu

Connect: anirudhgirish08@gmail.com