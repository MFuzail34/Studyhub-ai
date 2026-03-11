import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const freeFeatures = [
  "Access Lecture Hub",
  "Watch YouTube lectures",
  "Basic study timer",
  "Track daily study hours",
  "Limited lecture bookmarks",
];

const proFeatures = [
  "Everything in Free",
  "AI Study Planner",
  "Smart lecture recommendations",
  "Advanced study analytics",
  "Unlimited lecture bookmarks",
  "AI doubt assistant",
  "Exam countdown",
  "Study streak & badges system",
];

const comparisonFeatures = [
  { name: "Lecture Hub", free: true, pro: true },
  { name: "Study Timer", free: true, pro: true },
  { name: "Track Daily Study Hours", free: true, pro: true },
  { name: "Save Lectures", free: true, pro: true },
  { name: "Lecture Bookmarks", free: "Limited", pro: "Unlimited" },
  { name: "Study Analytics", free: "Basic", pro: "Advanced" },
  { name: "AI Study Planner", free: false, pro: true },
  { name: "Smart Recommendations", free: false, pro: true },
  { name: "AI Doubt Assistant", free: false, pro: true },
  { name: "Exam Countdown", free: false, pro: true },
  { name: "Study Streak & Badges", free: false, pro: true },
  { name: "Study Leaderboard", free: false, pro: true },
];

export default function Pricing() {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="gradient-text text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            StudifyHub
          </Link>
          <div className="flex gap-3">
            {user ? (
              <Button asChild className="gradient-primary border-0">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="gradient-primary border-0">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-4 gradient-primary border-0 text-primary-foreground">
            <Sparkles className="h-3 w-3 mr-1" /> Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Upgrade Your <span className="gradient-text">Study Game</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free and unlock powerful AI features when you're ready. Affordable plans designed for Indian students.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
          {/* Free */}
          <Card className="border shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Free</h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold">₹0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Perfect for getting started with study tracking.</p>
              <ul className="mt-8 space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-8" variant="outline" size="lg" asChild>
                <Link to={user ? "/dashboard" : "/signup"}>
                  {user ? "Go to Dashboard" : "Start Free"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-2 border-primary shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
            <span className="absolute top-4 right-4">
              <Badge className="gradient-primary border-0 text-primary-foreground">
                <Crown className="h-3 w-3 mr-1" /> Most Popular
              </Badge>
            </span>
            <CardContent className="p-8 pt-12">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Pro</h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold">₹99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-sm text-primary font-medium">or ₹799/year — save 33%!</p>
              <p className="mt-2 text-sm text-muted-foreground">AI-powered features to supercharge your studies.</p>
              <ul className="mt-8 space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              {isPro ? (
                <Button className="w-full mt-8 gradient-primary border-0" size="lg" disabled>
                  ✓ You're on Pro
                </Button>
              ) : (
                <Button className="w-full mt-8 gradient-primary border-0" size="lg" asChild>
                  <Link to={user ? "/upgrade" : "/signup"}>
                    Upgrade to Pro
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Feature <span className="gradient-text">Comparison</span>
          </h2>
          <div className="rounded-xl border overflow-hidden shadow-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold gradient-text">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, i) => (
                  <tr key={f.name} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                    <td className="p-4 font-medium">{f.name}</td>
                    <td className="p-4 text-center">
                      {f.free === true ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : f.free === false ? (
                        <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground text-xs">{f.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {f.pro === true ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-xs font-semibold text-primary">{f.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
          <p>© 2026 StudifyHub. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
