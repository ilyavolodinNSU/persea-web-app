import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { keycloak, initKeycloak } from "./keycloak";
import type { Role, UserProfile } from "../api/types";

interface AuthContextValue {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  profile: UserProfile | null;
  login: () => void;
  logout: () => void;
  ensureFreshToken: () => Promise<string>;
  hasAnyRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function tokenRoles(): Role[] {
  const parsed = keycloak.tokenParsed as
    | { realm_access?: { roles?: string[] } }
    | undefined;

  return parsed?.realm_access?.roles ?? [];
}

function fromToken(): UserProfile | null {
  const parsed = keycloak.tokenParsed as
    | {
        sub?: string;
        preferred_username?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        given_name?: string;
        family_name?: string;
      }
    | undefined;

  if (!parsed) return null;

  return {
    sub: parsed.sub,
    preferred_username: parsed.preferred_username,
    email: parsed.email,
    email_verified: parsed.email_verified,
    name: parsed.name,
    given_name: parsed.given_name,
    family_name: parsed.family_name,
    roles: tokenRoles(),
  };
}

type OidcUserInfo = Partial<{
  sub: string;
  preferred_username: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
}>;

function mergeProfile(info: OidcUserInfo | undefined): UserProfile | null {
  const fallback = fromToken();
  if (!info && !fallback) return null;

  return {
    ...fallback,
    sub: info?.sub ?? fallback?.sub,
    preferred_username:
      info?.preferred_username ?? fallback?.preferred_username,
    email: info?.email ?? fallback?.email,
    email_verified: info?.email_verified ?? fallback?.email_verified,
    given_name: info?.given_name ?? fallback?.given_name,
    family_name: info?.family_name ?? fallback?.family_name,
    name:
      info?.name ||
      [info?.given_name, info?.family_name].filter(Boolean).join(" ") ||
      fallback?.name,
    roles: tokenRoles(),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | undefined>();

  const refreshProfile = useCallback(async () => {
    if (!keycloak.authenticated) {
      setProfile(null);
      setToken(undefined);
      setAuthenticated(false);
      return;
    }

    let oidcProfile: OidcUserInfo | undefined;
    try {
      oidcProfile = (await keycloak.loadUserInfo()) as OidcUserInfo;
    } catch {
      oidcProfile = undefined;
    }

    setProfile(mergeProfile(oidcProfile));
    setToken(keycloak.token);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    let alive = true;

    initKeycloak()
      .then(async (isAuthenticated) => {
        if (!alive) return;
        setAuthenticated(isAuthenticated);
        if (isAuthenticated) await refreshProfile();
      })
      .catch(() => {
        if (!alive) return;
        setAuthenticated(false);
      })
      .finally(() => {
        if (alive) setInitialized(true);
      });

    const intervalId = window.setInterval(async () => {
      if (!keycloak.authenticated) return;
      try {
        const refreshed = await keycloak.updateToken(45);
        if (refreshed) {
          setToken(keycloak.token);
          setProfile(mergeProfile(undefined));
        }
      } catch {
        keycloak.login();
      }
    }, 30_000);

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(45).catch(() => keycloak.login());
    };

    return () => {
      alive = false;
      window.clearInterval(intervalId);
      keycloak.onTokenExpired = undefined;
    };
  }, [refreshProfile]);

  const login = useCallback(() => {
    keycloak.login({
      redirectUri: window.location.origin,
      scope: "openid profile email",
    });
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin });
  }, []);

  const ensureFreshToken = useCallback(async () => {
    if (!keycloak.authenticated) {
      await keycloak.login({ redirectUri: window.location.href });
      throw new Error("Authentication is required");
    }

    await keycloak.updateToken(45);
    setToken(keycloak.token);

    if (!keycloak.token) throw new Error("Missing access token");
    return keycloak.token;
  }, []);

  const hasAnyRole = useCallback(
    (...roles: Role[]) => {
      const activeRoles = profile?.roles ?? tokenRoles();
      return roles.some((role) => activeRoles.includes(role));
    },
    [profile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      authenticated,
      token,
      profile,
      login,
      logout,
      ensureFreshToken,
      hasAnyRole,
    }),
    [
      initialized,
      authenticated,
      token,
      profile,
      login,
      logout,
      ensureFreshToken,
      hasAnyRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
