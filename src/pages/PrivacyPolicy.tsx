import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <span className="gradient-text text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            StudyHub
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: March 10, 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            StudyHub ("we", "our", "us") is committed to protecting the privacy of our users, especially students who may be minors. This Privacy Policy is drafted in compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India and explains how we collect, use, store, and protect your personal data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Data We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">We collect the following data to provide our services:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Email address</strong> — for account creation and authentication</li>
            <li><strong>Study session data</strong> — subjects, duration, and dates of study sessions</li>
            <li><strong>Saved lectures</strong> — YouTube video references you save</li>
            <li><strong>Subject preferences</strong> — subjects you add to your profile</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed font-medium">We do NOT collect:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Aadhaar number or government ID</li>
            <li>Biometric data</li>
            <li>Location data</li>
            <li>Any unnecessary personal information</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Purpose of Data Collection</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To provide personalized study tracking and analytics</li>
            <li>To save your study progress and lecture history</li>
            <li>To authenticate your identity and secure your account</li>
            <li>To improve our platform and user experience</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Parental Consent for Minors</h2>
          <p className="text-muted-foreground leading-relaxed">
            In compliance with the DPDPA 2023, if you are under 18 years of age, we require verifiable parental or guardian consent before processing your personal data. We provide a parental consent mechanism during the registration process.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Data Storage & Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is stored securely using industry-standard encryption. We retain your data only as long as your account is active. Upon account deletion, all associated data is permanently removed within 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. Data Security</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>All data is transmitted over HTTPS (encrypted connection)</li>
            <li>Passwords are hashed and never stored in plain text</li>
            <li>Row-Level Security (RLS) ensures users can only access their own data</li>
            <li>Regular security audits and updates are performed</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">Under the DPDPA 2023, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Access</strong> — View all data we hold about you</li>
            <li><strong>Correction</strong> — Request correction of inaccurate data</li>
            <li><strong>Erasure</strong> — Request complete deletion of your data and account</li>
            <li><strong>Withdraw Consent</strong> — Withdraw your consent at any time</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            You can exercise these rights from your <Link to="/profile" className="text-primary hover:underline">Profile page</Link> or by contacting our Grievance Officer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use YouTube API Services to display educational lectures. By using the Lectures Hub, you agree to be bound by the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a>. We do not share your personal data with any third party for advertising or marketing purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">9. Children's Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not serve targeted advertisements to children. We do not track behavior for non-educational purposes. Student data is used solely for providing educational features. We do not sell or share student data with third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">10. Data Breach Notification</h2>
          <p className="text-muted-foreground leading-relaxed">
            In the event of a data breach, we will notify affected users and relevant authorities (Data Protection Board of India) as required under the DPDPA 2023, within 72 hours of becoming aware of the breach.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">11. Grievance Officer</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any concerns or complaints regarding your data, you may contact our Grievance Officer:
          </p>
          <div className="rounded-lg bg-card border p-4 text-sm text-muted-foreground">
            <p><strong>Email:</strong> grievance@studyhub.in</p>
            <p><strong>Response time:</strong> Within 30 days of receiving the complaint</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">12. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
          </p>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          © 2026 StudyTracker. Built with focus.
        </div>
      </footer>
    </div>
  );
}
