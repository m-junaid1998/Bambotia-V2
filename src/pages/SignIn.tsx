import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";
import { useCrudMutation } from "@/api/apiSlice";
import { loginSuccess } from "@/store/authSlice";
import { endpoints } from "@/api/config";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getApiErrorMessage } from "@/api/types";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [authTrigger, { isLoading }] = useCrudMutation();
  
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    const initGoogle = () => {
      if (cancelled) return;
      const googleAuth = window.google;
      if (!googleAuth) return;
      setupGoogleButton(googleAuth);
    };

    const existingScript = document.getElementById(
      "google-identity-script",
    ) as HTMLScriptElement | null;

    if (window.google) {
      initGoogle();
    } else if (existingScript) {
      existingScript.addEventListener("load", initGoogle);
    } else {
      const script = document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", initGoogle);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existingScript?.removeEventListener("load", initGoogle);
    };
  }, []);

  const setupGoogleButton = (googleAuth: GoogleIdentityServices) => {
    if (window.isGoogleInitialized) {
      const buttonDiv = document.getElementById("googleButtonDiv");
      if (buttonDiv) {
        googleAuth.accounts.id.renderButton(buttonDiv, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
        });
      }
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    try {
      googleAuth.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        ux_mode: "popup",
      });

      const buttonDiv = document.getElementById("googleButtonDiv");
      if (buttonDiv) {
        googleAuth.accounts.id.renderButton(buttonDiv, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
        });
      }
      window.isGoogleInitialized = true;
    } catch (configError) {
      console.error("Google Engine Configuration Error:", configError);
    }
  };

  const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
    try {
      const resData = await authTrigger({
        endpoint: endpoints.authRoutes.google,
        data: { idToken: response.credential },
      }).unwrap();

      if (resData?.token) {
        dispatch(loginSuccess({ token: resData.token, ...resData }));
        toast.success("Welcome back to BAMBOTIA!");
        navigate(resData.role === "admin" ? "/admin/dashboard" : "/", {
          replace: true,
        });
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Google Sign-in failed."));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authTrigger({
        endpoint: endpoints.authRoutes.login,
        data: { email: form.email, password: form.password },
      }).unwrap();

      dispatch(loginSuccess(response));
      toast.success("Logged in successfully!");
      
      if (response.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Login failed. Please check your credentials."));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-24 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.4em] text-accent mb-3">
              WELCOME BACK
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
              Sign In
            </h1>
            <div className="w-12 h-px bg-accent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Access your BAMBOTIA account to continue your luxury journey
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs tracking-[0.2em] text-foreground"
                >
                  EMAIL ADDRESS
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs tracking-[0.2em] text-foreground"
                >
                  PASSWORD
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label
                    htmlFor="remember"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 tracking-[0.2em] text-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "SIGN IN"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-[10px] tracking-[0.3em] text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <div
              id="googleButtonDiv"
              className="w-full flex justify-center [&>div]:w-full [&>div]:flex [&>div]:justify-center"
            ></div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            New to BAMBOTIA?{" "}
            <Link
              to="/signup"
              className="text-accent hover:underline font-medium tracking-wider"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
