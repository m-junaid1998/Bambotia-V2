import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-24 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.4em] text-accent mb-3">ACCOUNT RECOVERY</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">Forgot Password</h1>
            <div className="w-12 h-px bg-accent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {submitted
                ? "Check your inbox for further instructions"
                : "Enter your email and we'll send you a link to reset your password"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl text-foreground">Email Sent</h2>
                  <p className="text-sm text-muted-foreground">
                    A password reset link has been sent to{" "}
                    <span className="text-foreground font-medium">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Didn't receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-accent hover:underline tracking-wider"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs tracking-[0.2em] text-foreground">
                    EMAIL ADDRESS
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 tracking-[0.2em] text-xs">
                  SEND RESET LINK
                </Button>
              </form>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    
    </div>
  );
};

export default ForgotPassword;
