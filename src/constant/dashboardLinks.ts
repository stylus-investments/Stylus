import { faDiagramProject, faSackDollar, faUserPlus, faWallet } from "@fortawesome/free-solid-svg-icons";

export const dashboardLinks = [
    {
        icon: faWallet,
        label: "Wallet",
        link: '/dashboard/wallet'
    },
    {
        icon: faSackDollar,
        label: "Reward",
        link: '/dashboard/reward'
    },
    {
        icon: faUserPlus,
        label: "Referrals",
        link: '/dashboard/referrals'
    },
    {
        icon: faDiagramProject,
        label: "Project",
        link: '/dashboard/project'
    },
];