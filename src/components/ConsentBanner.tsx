import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

const CONSENT_KEY = "studyhub_data_consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="max-w-2xl mx-auto rounded-xl border bg-card shadow-lg p-5 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Data Collection Consent</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              StudyHub collects your email, study session data, and saved lectures to provide personalized study tracking. We comply with the <strong>Digital Personal Data Protection Act, 2023</strong>. Your data is encrypted and never shared with third parties for advertising.
            </p>
            <p className="text-xs text-muted-foreground">
              Read our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
              {" "}and{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}for full details.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" className="gradient-primary border-0" onClick={handleAccept}>
            I Agree
          </Button>
        </div>
      </div>
    </div>
  );
}
