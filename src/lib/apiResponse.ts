

//200 response
const okayRes = (data?: any) => {
    if (data) return { ok: true, data: data }

    return { ok: true }
}

export {
    okayRes
}