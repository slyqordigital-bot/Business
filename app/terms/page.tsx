import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms" };

export default function Terms() {
  return (
    <LegalPage title="Terms" updated="November 26, 2026">
      <p>By using MacroSnap you agree to these terms. They are short on purpose.</p>
      <h2>The service</h2>
      <p>MacroSnap estimates the foods, portions, calories and macros of a meal from a photo. Estimates can be off, especially for hidden oils, sauces and mixed dishes. You can correct any portion. MacroSnap is not medical or dietary advice; talk to a doctor or registered dietitian for that.</p>
      <h2>Your account</h2>
      <p>Keep your password safe. You own your photos and data. Upload only photos you have the right to use, and nothing illegal or harmful.</p>
      <h2>Plans and payments</h2>
      <p>Paid plans renew automatically each month or year until you cancel. Payments are processed by Whop through Kwop. Each plan includes a set number of scans per billing period, shown before you pay. Cancel anytime from Account → Billing; you keep your plan until the end of the period you paid for. Prices are in USD.</p>
      <h2>Fair use</h2>
      <p>Free scans are limited per day. Don&apos;t try to get around limits or overload the service.</p>
      <h2>Changes</h2>
      <p>We may update MacroSnap and these terms. If a change matters, we&apos;ll tell you in the app before it applies.</p>
    </LegalPage>
  );
}
