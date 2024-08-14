import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';
import { userRoute } from '@/routes/userRoute';
import { currencyRoute } from '@/routes/currencyRoute';
import { tokenRoute } from '@/routes/tokenRoute';
import { orderRoute } from '@/routes/orderRoute';

export const appRouter = router({
    dashboard: dashboardRoute,
    snapshot: snapshotRoute,
    user: userRoute,
    currency: currencyRoute,
    token: tokenRoute,
    order: orderRoute,
})

export type AppRouter = typeof appRouter;