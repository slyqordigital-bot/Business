import Script from "next/script";

/** Kwop visit analytics — public pages only (landing, sign-up, log-in), never inside the app. */
export function KwopFlow() {
  return <Script src="https://kwop.io/flow.js" data-site="s_6522168370" strategy="lazyOnload" />;
}
