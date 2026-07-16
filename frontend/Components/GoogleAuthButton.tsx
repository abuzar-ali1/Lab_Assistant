"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/Context/AuthContext";
import { getApiError } from "@/lib/errors";

export default function GoogleAuthButton({ label }: { label: string }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const startGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await googleLogin(tokenResponse.access_token);
        toast.success("Welcome to LabSaathi");
      } catch (error) {
        toast.error(getApiError(error, "Google sign-in could not be completed."));
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or unavailable."),
  });

  return (
    <button
      type="button"
      onClick={() => configured && startGoogleLogin()}
      disabled={loading || !configured}
      title={!configured ? "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in" : undefined}
      className="button-secondary w-full !min-h-12"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
      {configured ? label : "Google sign-in needs configuration"}
    </button>
  );
}

function GoogleIcon() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-black text-[#4285f4] shadow-sm" aria-hidden="true">G</span>
  );
}
