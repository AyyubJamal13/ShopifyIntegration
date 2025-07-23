import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {registerWebhookManually} from "../utils/registerWebhook"
import {loginUser} from "../utils/Login"

export const loader = async ({ request }) => {
  const { session , admin } = await authenticate.admin(request);

  const shopName = session.shop;
  const response = await admin.graphql(`
    query {
      shop {
        id
      }
    }
  `);

  const json = await response.json();
  const shopId = json.data.shop.id;
  // method of verfication (shop name , shop id );

  const isRegistered = true;//await loginUser(shopName); // or false, depending on logic
  
  if (isRegistered) {
    const webhookTopics = [
          { topic: "orders/create", path: "orders/create" },
          //{ topic: "order/update", path: "order/update" },
        ];
        //const Session = session.session;
        for (const { topic, path } of webhookTopics) {
          await registerWebhookManually({
            session,
            topic,
            address: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/${shopId}/${path}`,
          });
        }
  }
  

  return { isRegistered };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const { isRegistered } = useLoaderData(); 
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #6e8efb, #a777e3)';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    if (productId) {
      //shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });


  if (!isRegistered) {
    return (
      <Page>
        <TitleBar title="Registration Required" />
        <Card>
          <Text variant="headingMd">You are not registered.</Text>
        </Card>
      </Page>
    );
  }

   return (
    <Page fullWidth>
      <TitleBar title="Welcome on Darjaah App" />

      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
        <Card sectioned style={{ maxWidth: 500, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', borderRadius: '16px' }}>
          <Text variant="headingLg" as="h2">
             You are a registered user!
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued" style={{ marginTop: '1rem' }}>
            Thank you for joining Darjaah. We're excited to have you onboard!
          </Text>
        </Card>
      </div>
    </Page>
  );
}
