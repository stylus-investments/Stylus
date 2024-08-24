import 'dotenv/config'
import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

const pusherConfig = {
    appID: process.env.NEXT_PUBLIC_PUSHER_APP_ID as string,
    key: process.env.PUSHER_KEY as string,
    secret: process.env.PUSHER_SECRET as string,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
}

export const pusherServer = new PusherServer({
    appId: pusherConfig.appID,
    key: pusherConfig.key,
    secret: pusherConfig.secret,
    cluster: pusherConfig.cluster,
    useTLS: true,
})

export const pusherClient = new PusherClient(pusherConfig.key, {
    cluster: pusherConfig.cluster
})