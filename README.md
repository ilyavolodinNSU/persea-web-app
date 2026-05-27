# Persea Frontend

React + Bootstrap клиент для Persea. Вход выполняется через Keycloak Authorization Code Flow с PKCE `S256`; профиль берется из OIDC `userinfo`, с fallback на claims токена.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:5173`.

По умолчанию Vite проксирует API:

- `/api/product-service` -> `http://localhost:8084`
- `/api/user-service` -> `http://localhost:8085`
- `/api/recommendation-service` -> `http://localhost:8086`

Keycloak client: `persea-web`.
