/// <reference types="vite/client" />

/** Minimal shape of the Google Identity Services (GSI) client loaded via <script>. */
interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        ux_mode?: "popup" | "redirect";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "large" | "medium" | "small";
          text?: "signin_with" | "signup_with" | "continue_with" | "signin";
          shape?: "rectangular" | "pill" | "circle" | "square";
        },
      ) => void;
    };
  };
}

interface Window {
  google?: GoogleIdentityServices;
  isGoogleInitialized?: boolean;
}

