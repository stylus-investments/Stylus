import { sessionRoute } from '@/routes/sessionRoute';
import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';
import { userRoute } from '@/routes/userRoute';
import { currencyRoute } from '@/routes/currencyRoute';

export const appRouter = router({
    session: sessionRoute,
    dashboard: dashboardRoute,
    snapshot: snapshotRoute,
    user: userRoute,
    currency: currencyRoute
})

export type AppRouter = typeof appRouter;