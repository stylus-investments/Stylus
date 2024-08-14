import { faDiagramProject, faListUl, faSackDollar, faWallet } from "@fortawesome/free-solid-svg-icons";

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
        icon: faListUl,
        label: "Actions",
        link: '/dashboard/actions'
    },
    {
        icon: faDiagramProject,
        label: "Project",
        link: '/dashboard/project'
    },
];

['Wallet', 'Reward', 'Bond', 'Project']