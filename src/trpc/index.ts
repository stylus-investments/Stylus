import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';
import { currencyRoute } from '@/routes/currencyRoute';
import { tokenRoute } from '@/routes/tokenRoute';
import { orderRoute } from '@/routes/orderRoute';

export const appRouter = router({
    dashboard: dashboardRoute,
    snapshot: snapshotRoute,
    currency: currencyRoute,
    token: tokenRoute,
    order: orderRoute,
})

export type AppRouter = typeof appRouter;