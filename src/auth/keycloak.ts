import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "persea",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "persea-web",
});

let initPromise: Promise<boolean> | null = null;

export function initKeycloak() {
  if (!initPromise) {
    initPromise = keycloak.init({
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
  }

  return initPromise;
}
