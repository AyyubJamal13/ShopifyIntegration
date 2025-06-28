export async function registerWebhookManually({ session, topic, address, apiVersion = "2024-01" }) {
  try {
    const response = await fetch(`https://${session.shop}/admin/api/${apiVersion}/webhooks.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: "json",
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Failed to register webhook for topic: ${topic}`);
      console.error("Reason:", result);
      return false;
    }

    console.log(`✅ Webhook registered for topic: ${topic}`, result.webhook?.id);
    return true;
  } catch (err) {
    console.error(`❌ Error registering webhook for topic: ${topic}`, err);
    return false;
  }
}
