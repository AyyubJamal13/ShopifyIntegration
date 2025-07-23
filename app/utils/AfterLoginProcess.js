import { authenticate } from "../shopify.server";
import { registerWebhookManually } from "./registerWebhook"

export async function AfterLoginProcess(session) {
    try {
        console.log("AfterLoginProcess");
        //const { session, admin } = await authenticate.admin(request);
        console.log("Store:", session.shop);
        console.log(" Access Token:", session.accessToken);

        const webhookTopics = [
            { topic: "products/create", path: "products/create" },
            { topic: "products/update", path: "products/update" },
        ];

        for (const { topic, path } of webhookTopics) {
            await registerWebhookManually({
                session,
                topic,
                address: `${WEBHOOK_BASE_URL}/api/webhooks/${path}`,
            });
        }

    } catch (error) {
        console.error(error)
    }
}
