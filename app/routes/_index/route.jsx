import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import styles from "./styles.module.css";
import { login, sessionStorage } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // If there's no shop param, just show the login form
  if (!shop) {
    return { showForm: Boolean(login) };
  }

  // If there's a shop param, check for an existing session
  const session = await sessionStorage.loadCurrentSession(
    request,
    new Response(),
    true
  );

  if (!session) {
    // No session, redirect to /auth
    throw redirect(`/auth?shop=${shop}`);
  }

  // Session exists, redirect to your app dashboard or page
  throw redirect(`/app?${url.searchParams.toString()}`);
};


export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
