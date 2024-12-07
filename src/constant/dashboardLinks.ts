import { faCircleUser, faUserPlus, faWallet, faDiagramProject } from "@fortawesome/free-solid-svg-icons";
export const dashboardLinks = [
    {
        icon: faWallet,
        label: "Wallet",
        link: '/dashboard/wallet'
    },
    {
        icon: faDiagramProject,
        label: "Project",
        link: '/dashboard/project'
    },
    {
        icon: faUserPlus,
        label: "Referrals",
        link: '/dashboard/referrals'
    },
    {
        icon: faCircleUser,
        label: "Profile",
        link: '/dashboard/profile'
    },
];