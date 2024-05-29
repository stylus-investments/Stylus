import { faDollarSign, faEuroSign, faPesoSign } from "@fortawesome/free-solid-svg-icons"

const availableCurrencies = [
    {
        currency: "USD",
        icon: faDollarSign
    },
    {
        currency: "PHP",
        icon: faPesoSign
    },
    {
        currency: "EUR",
        icon: faEuroSign
    },
]

export { availableCurrencies }