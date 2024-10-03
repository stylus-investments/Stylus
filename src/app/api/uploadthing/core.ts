import { getUserId } from "@/lib/privy";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    orderReceiptUploader: f({ image: { maxFileSize: "8MB" } })
        // Set permissions and file types for this FileRoute
        .middleware(async () => {
            // This code runs on your server before upload
            const user = await getUserId();

            // If you throw, the user will not be able to upload
            if (!user) throw new UploadThingError("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { ok: true };
        })
        .onUploadComplete(async () => {

            // This code RUNS ON YOUR SERVER after upload
            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        }),
    profileIdUploader: f({ image: { maxFileCount: 1, maxFileSize: "8MB" } })
        .middleware(async () => {

            const user = await getUserId();
            if (!user) throw new UploadThingError("Unauthorized");

            return { ok: true }
        })
        .onUploadComplete(async (data) => {
            
        })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;