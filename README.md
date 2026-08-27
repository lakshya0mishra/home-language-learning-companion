# 📚 Home Language Learning Companion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://hackathon-tcs.vercel.app)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev/)

> **Help your child learn in both their school language and home language.** Bilingual curriculum-aligned learning companion with audio read-aloud for multilingual families.

---

## 🚀 Direct Live Access

### 🔗 **[Click Here to Open the Live Application](https://hackathon-tcs.vercel.app)**

---

## ✨ Features

- 🔐 **Google Authentication**: Sign in using your Google/Gmail account with secure session persistence.
- 🎓 **Student Class & Subject Tracking**: Retains child's class/grade, selected favorite subjects, and languages across logins.
- 📖 **Bilingual Curriculum Lessons**: Side-by-side or tabbed dual-language reading with audio read-aloud support.
- ⏱️ **Study Progress Tracking**: Automatically logs what topics students have studied till now with real-time timestamps in Firestore.
- ⬇️ **Offline Learning**: Save topics locally and sync them with Cloud Firestore for offline access.
- 🌓 **Dark / Light Mode**: Seamless theme switching with persistent preferences.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Vanilla CSS
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **Deployment**: Vercel (Production SPA)

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lakshya0mishra/home-language-learning-companion.git
   cd home-language-learning-companion
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
