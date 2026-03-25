# Dashboard System

Fitur:
- List projects
- Label FREE / PREMIUM
- Tombol **Buat Project**
- Rule: hanya 1 FREE project
- Jika user sudah punya FREE project dan klik Buat Project, tampil **upgrade modal**

## API logic

- `listProjects(userId)` -> ambil daftar project user dari Supabase
- `createProject({ userId, type })` -> cek FREE existing dulu, lalu insert project
- Jika FREE sudah ada, return `FREE_LIMIT_REACHED`

## UI + state handling

- `ProjectDashboard` pakai `useReducer` untuk state loading, error, list, create action, dan modal state
- `UpgradeModal` dipanggil saat rule FREE limit terpenuhi

## Example

```tsx
import { ProjectDashboard } from './components/dashboard';

<ProjectDashboard
  userId={user.id}
  onUpgradeClick={() => {
    // arahkan ke halaman upgrade / pricing
    window.location.assign('/pricing');
  }}
/>
```
