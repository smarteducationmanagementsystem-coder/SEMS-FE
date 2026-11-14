# Smart Education Management System

Next.js 16 frontend for Smart Education Management System. Schools, colleges, and academies each open their own campus account. The public site and the campus dashboard run on local sample data so a backend API can be connected later.

## Run

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL
pnpm dev                     # http://localhost:3000
```

| Command | Purpose |
|---|---|
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | ESLint · TypeScript · Vitest |

## Where things live

- Public pages for students, teachers, staff, fees, attendance, exams, results, and reports: `src/app/`
- Homepage: `src/components/home/`
- Campus dashboard: `src/components/institution/`
- Brand, navigation, SEO, policies, and copy: `src/config/`

See `../docs/` for the design system, structure, SEO/AEO and the integration plan.
# SEMS
# SEMS-FE
