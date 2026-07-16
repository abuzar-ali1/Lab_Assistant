"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/Context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider
      clientId={
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "placeholder-google-client-id.apps.googleusercontent.com"
      }
    >
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4200,
            style: {
              borderRadius: "16px",
              border: "1px solid #dce7e2",
              background: "#ffffff",
              color: "#17302a",
              boxShadow: "0 18px 50px rgba(27, 62, 53, 0.14)",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 650,
            },
          }}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
