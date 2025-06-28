import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import {registerWebhookManually } from "./utils/registerWebhook"
console.log(
  process.env.SHOPIFY_API_KEY + " -- " + process.env.SHOPIFY_API_SECRET,
);

const WEBHOOK_BASE_URL = "https://afe3-111-88-11-20.ngrok-free.app";



const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),

  hooks: {
    afterAuth: async ({ session, admin }) => {
    console.log("✅ Store:", session.shop);
    console.log("🔑 Access Token:", session.accessToken);

    const webhookTopics = [
        { topic: "products/create", path: "products-create" },
        { topic: "products/update", path: "products-update" },
      ];

      for (const { topic, path } of webhookTopics) {
        await registerWebhookManually({
          session,
          topic,
          address: `${WEBHOOK_BASE_URL}/webhook/${path}`,
        });
      }
    }
  },
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
