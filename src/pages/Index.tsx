import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, BarChart3, Flame, Check } from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Study Timer",
    description: "Pomodoro-style timer to keep your study sessions focused and productive.",
  },
  {
    icon: BarChart3,
    title: "Study Analytics",
    description: "Visualize your study patterns with detailed charts and weekly breakdowns.",
  },
  {
    icon: Flame,
    title: "Study Streak",
    description: "Stay motivated by tracking your consecutive study days and building habits.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Unlimited study sessions", "Basic analytics", "Up to 5 subjects", "7-day history"],
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    features: ["Everything in Free", "Advanced analytics", "Unlimited subjects", "Full history", "Export data"],
    popular: true,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="gradient-text text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            StudyTracker
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="gradient-primary border-0">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Track Your Study Time
            <br />
            <span className="gradient-text">and Stay Consistent</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Build better study habits with a focused timer, detailed analytics, and streak tracking. Your academic success starts here.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Button size="lg" asChild className="gradient-primary border-0 text-base px-8">
              <Link to="/signup">Start Studying</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to <span className="gradient-text">study smarter</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-5">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple <span className="gradient-text">pricing</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`border shadow-md ${plan.popular ? "ring-2 ring-primary relative" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-8 ${plan.popular ? "gradient-primary border-0" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
          <p>© 2026 StudyTracker. Built with focus.</p>
        </div>
      </footer>
    </div>
  );
}
