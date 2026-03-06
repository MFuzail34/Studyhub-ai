

## Study Tracker — Implementation Plan

### Design
- Clean, minimal SaaS dashboard aesthetic with **blue-purple gradient** accents
- Soft shadows, rounded cards, and consistent spacing
- Sidebar navigation (collapsible on mobile)
- Light mode by default

### Pages & Features

**1. Landing Page**
- Hero section: "Track Your Study Time and Stay Consistent" with CTA button
- 3 feature cards: Study Timer, Study Analytics, Study Streak
- Simple pricing section (Free / Pro)

**2. Authentication (Supabase)**
- Login & Signup pages with email and Google sign-in
- Protected routes — redirect unauthenticated users to login

**3. Dashboard**
- Cards: Today's study time, Weekly study time, Study streak
- Bar chart showing weekly study hours (using Recharts)
- "Start Study Session" button linking to timer

**4. Study Timer**
- Pomodoro-style timer with large display
- Subject dropdown (user-created subjects)
- Start / Pause / Stop controls
- Auto-saves session to Supabase on stop

**5. Study History**
- Table of past sessions (date, subject, duration)
- Filter by: Today, This Week, This Month

**6. Profile Page**
- Display user email and account info
- Manage subjects (add/remove)

### Sidebar Navigation
- Dashboard, Study Timer, History, Profile
- Collapsible on mobile with hamburger trigger

### Database (Supabase)
- **profiles** table: id, email, created_at
- **subjects** table: id, user_id, subject_name
- **study_sessions** table: id, user_id, subject, duration, date
- Row-level security on all tables
- Auto-create profile on signup via trigger

### Additional Logic
- Study streak calculated from consecutive days with sessions
- Weekly analytics aggregated from study_sessions
- Loading states and toast notifications for actions

