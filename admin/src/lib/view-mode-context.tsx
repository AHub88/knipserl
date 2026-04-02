"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export type ViewMode = "admin" | "driver" | "accounting";

type ViewModeContextType = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isAdmin: boolean;
  impersonateDriverId: string | null;
  setImpersonateDriverId: (id: string | null) => void;
};

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "admin",
  setViewMode: () => {},
  isAdmin: false,
  impersonateDriverId: null,
  setImpersonateDriverId: () => {},
});

export function ViewModeProvider({
  children,
  userRole,
  initialViewMode,
  initialDriverId,
}: {
  children: React.ReactNode;
  userRole: string;
  initialViewMode?: ViewMode;
  initialDriverId?: string | null;
}) {
  const router = useRouter();
  const isAdmin = userRole === "ADMIN";

  function readCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  const [viewMode, setViewModeState] = useState<ViewMode>(
    () => (readCookie("viewMode") as ViewMode) || initialViewMode || "admin"
  );
  const [impersonateDriverId, setImpersonateDriverIdState] = useState<string | null>(
    () => readCookie("impersonateDriverId") || initialDriverId || null
  );

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);
      if (mode !== "driver") {
        setImpersonateDriverIdState(null);
        document.cookie = "impersonateDriverId=;path=/;max-age=0";
      }
      document.cookie = `viewMode=${mode};path=/;max-age=86400`;
      router.refresh();
    },
    [router]
  );

  const setImpersonateDriverId = useCallback(
    async (id: string | null) => {
      setImpersonateDriverIdState(id);
      if (id) {
        document.cookie = `impersonateDriverId=${id};path=/;max-age=86400;SameSite=Lax`;
      } else {
        document.cookie = "impersonateDriverId=;path=/;max-age=0;SameSite=Lax";
      }
      // Force full page reload so server components re-read the cookie
      window.location.reload();
    },
    []
  );

  return (
    <ViewModeContext.Provider
      value={{ viewMode, setViewMode, isAdmin, impersonateDriverId, setImpersonateDriverId }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
