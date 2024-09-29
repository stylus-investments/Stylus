import { router } from './trpc'
import { dashboardRoute } from '@/routes/dashboardRoute';
import { snapshotRoute } from '@/routes/snapshotRoute';
import { currencyRoute } from '@/routes/currencyRoute';
import { tokenRoute } from '@/routes/tokenRoute';
import { orderRoute } from '@/routes/orderRoute';
import { adminRoute } from '@/routes/adminRoute';
import { orderMessageRoute } from '@/routes/orderMessageRoute';
import { userRoute } from '@/routes/userRoute';
import { investmentPlanRoute } from '@/routes/investmentPlanRoute';
import { packageRoute } from '@/routes/packageRoute';
import { referralsRoute } from '@/routes/referralsRoute';
import { notificationRoute } from '@/routes/notificationRoute';

export const appRouter = router({
    dashboard: dashboardRoute,
    snapshot: snapshotRoute,
    currency: currencyRoute,
    token: tokenRoute,
    order: orderRoute,
    admin: adminRoute,
    message: orderMessageRoute,
    user: userRoute,
    investment: investmentPlanRoute,
    package: packageRoute,
    referral: referralsRoute,
    notification: notificationRoute
})

export type AppRouter = typeof appRouter;