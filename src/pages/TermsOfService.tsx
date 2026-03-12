import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: March 10, 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using StudyHub, you agree to be bound by these Terms of Service. If you are under 18 years of age, your parent or legal guardian must agree to these terms on your behalf.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            StudyHub is an educational platform that provides study tracking tools, analytics, lecture discovery, and AI-powered study assistance. We may offer courses and certificates that comply with applicable educational regulations including UGC and AICTE guidelines where required.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>Users under 18 must obtain parental consent before creating an account</li>
            <li>One person may not maintain multiple accounts</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed">You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to access other users' data</li>
            <li>Interfere with or disrupt the platform's operation</li>
            <li>Upload malicious content or code</li>
            <li>Misrepresent your identity or age</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content, features, and functionality of StudyTracker are owned by us and are protected by copyright, trademark, and other intellectual property laws. YouTube content displayed through our Lectures Hub is owned by the respective content creators and is subject to YouTube's Terms of Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. Educational Content Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            StudyTracker is a supplementary educational tool. We do not guarantee specific academic results. Claims about study improvement are based on general research and individual results may vary. We do not make claims such as "100% exam success" or guaranteed outcomes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">7. Data Deletion</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may request complete deletion of your account and all associated data at any time from your Profile page. Upon deletion request, all your personal data, study sessions, saved lectures, and subject preferences will be permanently removed within 30 days. This action is irreversible.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">8. Consumer Protection</h2>
          <p className="text-muted-foreground leading-relaxed">
            In compliance with the Consumer Protection Act, 2019, we commit to transparent pricing for any paid features, clear refund policies, and honest representation of our services. No misleading advertisements or false claims will be made.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            StudyTracker is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you, if any, for accessing the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">10. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For any questions regarding these Terms, please contact us at:
          </p>
          <div className="rounded-lg bg-card border p-4 text-sm text-muted-foreground">
            <p><strong>Email:</strong> support@studytracker.in</p>
          </div>
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
