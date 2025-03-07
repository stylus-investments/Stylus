const ORDERSTATUS = {
    'unpaid': 'unpaid',
    'invalid': 'invalid',
    'processing': 'processing',
    'paid': 'paid',
    'upcoming': "upcoming"
}
const PAYMENT_METHOD = {
    'INSTAPAY': 'INSTAPAY',
    'BPI': 'BPI',
};

const ORDER_TYPE = {
    'sbtc': "sbtc",
    "sphp": "sphp"
} as const

export { ORDERSTATUS, PAYMENT_METHOD, ORDER_TYPE }