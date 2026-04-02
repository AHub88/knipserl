"use client";

import { createContext, useContext, useState, useCallback } from "react";
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
}: {
  children: React.ReactNode;
  userRole: string;
  initialViewMode?: ViewMode;
}) {
  const router = useRouter();
  const isAdmin = userRole === "ADMIN";
  const [viewMode, setViewModeState] = useState<ViewMode>(
    initialViewMode ?? "admin"
  );
  const [impersonateDriverId, setImpersonateDriverIdState] = useState<string | null>(null);

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
    (id: string | null) => {
      setImpersonateDriverIdState(id);
      if (id) {
        document.cookie = `impersonateDriverId=${id};path=/;max-age=86400`;
      } else {
        document.cookie = "impersonateDriverId=;path=/;max-age=0";
      }
      router.refresh();
    },
    [router]
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
