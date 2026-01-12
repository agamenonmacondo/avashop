"use client";

import { useAuth } from "@/hooks/useAuth";
import { ChatWidget } from "./ChatWidget";

export function AuthenticatedChatWidget() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // O un skeleton/spinner si prefieres
  }

  return (
    <ChatWidget
      userEmail={user?.email ?? undefined}
      userName={user?.displayName ?? undefined}
    />
  );
}