import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';
import { currencyRoute } from '@/routes/currencyRoute';
import { tokenRoute } from '@/routes/tokenRoute';
import { orderRoute } from '@/routes/orderRoute';
import { adminRoute } from '@/routes/adminRoute';
import { orderMessageRoute } from '@/routes/orderMessageRoute';
import { userRoute } from '@/routes/userRoute';

export const appRouter = router({
    dashboard: dashboardRoute,
    snapshot: snapshotRoute,
    currency: currencyRoute,
    token: tokenRoute,
    order: orderRoute,
    admin: adminRoute,
    message: orderMessageRoute,
    user: userRoute
})

export type AppRouter = typeof appRouter;