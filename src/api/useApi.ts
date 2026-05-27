import { useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";
import { createApi } from "./client";

export function useApi() {
  const { ensureFreshToken } = useAuth();
  return useMemo(() => createApi(ensureFreshToken), [ensureFreshToken]);
}
