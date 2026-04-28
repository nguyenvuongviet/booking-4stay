"use client";

import { NEXT_PUBLIC_GOOGLE_CLIENT_ID } from "@/constants/app.constant";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      {children}
    </GoogleOAuthProvider>
  );
}
