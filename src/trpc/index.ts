import { sessionRoute } from '@/routes/sessionRoute';
import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';
import { userRoute } from '@/routes/userRoute';
import { currencyRoute } from '@/routes/currencyRoute';
import { tokenRoute } from '@/routes/tokenRoute';
import { orderRoute } from '@/routes/orderRoute';
import { profileRoute } from '@/routes/profileRoute';

export const appRouter = router({
    session: sessionRoute,
    dashboard: dashboardRoute,
    snapshot: snapshotRoute,
    user: userRoute,
    currency: currencyRoute,
    token: tokenRoute,
    order: orderRoute,
    profile: profileRoute
})

export type AppRouter = typeof appRouter;