import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSuccess } from "@/store/authSlice";
import { toast } from "sonner";
import { endpoints } from "@/api/config";
import { useCrudMutation } from "@/api/apiSlice";
import { getApiErrorMessage } from "@/api/types";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [authTrigger, { isLoading }] = useCrudMutation();

  const [formdata, setFormdata] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormdata((prev) => ({ ...prev, [id]: value }));
  };

  const inputClass = (fieldName: string) =>
    `pl-10 h-12 text-xs sm:text-sm placeholder:text-sm placeholder:tracking-normal ${
      errors[fieldName] ? "border-red-500 focus-visible:ring-red-500" : ""
    }`;


  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formdata.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formdata.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!formdata.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formdata.email)) newErrors.email = "Email is invalid";
    if (formdata.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          text: "signup_with",
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
          text: "signup_with",
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
        toast.success(resData.message || "Google Authentication Success!");
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Google Validation failed."));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const resData = await authTrigger({
        endpoint: endpoints.authRoutes.register,
        data: { 
          firstname: formdata.firstname, 
          lastname: formdata.lastname, 
          email: formdata.email, 
          password: formdata.password 
        },
      }).unwrap();
      if (resData?.token) {
        dispatch(loginSuccess({ token: resData.token, ...resData }));
        toast.success(
          resData.message || "Welcome to Bambotia Account Ecosystem!",
        );
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Registration sequence broke."));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-20 md:pt-24 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.4em] text-accent mb-3">
              JOIN THE HOUSE
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-3">
              Create Account
            </h1>
            <div className="w-12 h-px bg-accent mx-auto mb-4" />
          </div>

          <div className="bg-card border border-border rounded-lg p-5 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-[10px] sm:text-xs tracking-[0.2em] text-foreground">
                    FIRST NAME
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstname"
                      value={formdata.firstname}
                      onChange={handleInputChange}
                      className={inputClass("firstname")}
                      placeholder="FIRST NAME"
                    />
                  </div>
                  {errors.firstname && (
                    <p className="text-red-500 text-[10px]">
                      {errors.firstname}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-[10px] sm:text-xs tracking-[0.2em] text-foreground">
                    LAST NAME
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lastname"
                      value={formdata.lastname}
                      onChange={handleInputChange}
                      className={inputClass("lastname")}
                      placeholder="LAST NAME"
                    />
                  </div>
                  {errors.lastname && (
                    <p className="text-red-500 text-[10px]">
                      {errors.lastname}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] sm:text-xs tracking-[0.2em] text-foreground">
                  EMAIL ADDRESS
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formdata.email}
                    onChange={handleInputChange}
                    className={inputClass("email")}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[10px]">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] sm:text-xs tracking-[0.2em] text-foreground">
                  PASSWORD
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formdata.password}
                    onChange={handleInputChange}
                    className={inputClass("password")}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[10px]">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 tracking-[0.2em]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "CREATE ACCOUNT"
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

            <div className="w-full flex justify-center mt-6">
              <div
                id="googleButtonDiv"
                className="w-full max-w-full flex justify-center"
              ></div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground my-6">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-accent hover:underline font-medium tracking-wider"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUp;