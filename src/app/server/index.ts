import { sessionRoute } from '@/routes/sessionRoute';
import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';

export const appRouter = router({
    session: sessionRoute,
    dashboard: dashboardRoute,
    snapshot: snapshotRoute
})

export type AppRouter = typeof appRouter;