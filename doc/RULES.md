# Development Rules and Standards

## General Coding Guidelines
1.  **TypeScript Strictness**: All code must be strongly typed. Avoid using `any` unless absolutely necessary.
2.  **Functional Components**: Use React Functional Components with Hooks.
3.  **File Naming**:
    -   React Components: PascalCase (e.g., `ContactList.tsx`).
    -   Utility/Helper files: camelCase (e.g., `formatDate.ts`).
4.  **Imports**: Use absolute imports via the `@/` alias (e.g., `@/components/ui/button`).

## Architecture Rules
1.  **Component Design**:
    -   **Page Components**: Should handle data fetching and pass data down to presentation components.
    -   **Presentation Components**: Should be reusable and (mostly) stateless.
2.  **State Management**:
    -   Use **React Query** for all server-state (data fetching, caching, synchronization).
    -   Use `useState` / `useReducer` for local UI state only.
    -   Avoid global state managers like Redux unless complex cross-component state is required.
3.  **Routing**:
    -   All routes must be defined in `App.tsx`.
    -   Main application routes must be wrapped in `ProtectedRoute` and `DashboardLayout`.

## Security Rules (Critical)
1.  **Row Level Security (RLS)**:
    -   RLS is the primary mechanism for data security.
    -   Every table in the `public` schema **MUST** have RLS enabled.
    -   Every table **MUST** have a `user_id` column referencing `auth.users(id)`.
    -   Policies must restrict access to `user_id = auth.uid()`.
2.  **Environment Variables**:
    -   Never commit `.env` files to version control.
    -   Only `VITE_` prefixed variables are exposed to the client.

## UI/UX Standards
1.  **Styling**: Use Tailwind CSS utility classes. Avoid custom CSS files unless creating complex animations or global overrides in `index.css`.
2.  **Responsiveness**: All pages must be responsive. Use standard Tailwind breakpoints (`md`, `lg`).
3.  **Loading States**: All data fetching operations must show a loading state (Skeleton or Spinner).
4.  **Error Handling**: All API errors must be caught and displayed to the user via Toast notifications (Sonner).
