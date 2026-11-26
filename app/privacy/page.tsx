import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="November 26, 2026">
      <p>MacroSnap helps you log what you eat from a photo. Here is what we keep, why, and how to delete it. In short: your photos are yours, only you can see them, and you can delete everything at any time.</p>
      <h2>What we keep</h2>
      <ul>
        <li><b>Your email</b>, to give you an account.</li>
        <li><b>Your meal photos and their results</b> (foods, portions, calories and macros), stored in a private storage space that only your account can read.</li>
        <li><b>Your goals and answers</b> you set in Settings.</li>
        <li><b>Usage</b>: how many scans you made, for your plan&apos;s monthly quota.</li>
      </ul>
      <h2>Photos you scan before signing up</h2>
      <p>If you try MacroSnap without an account, your photo and its result are kept privately for up to 7 days so they can wait for you if you sign up. If you don&apos;t, they are deleted automatically.</p>
      <h2>Who processes your data</h2>
      <ul>
        <li><b>Supabase</b> stores your account, meals and photos.</li>
        <li><b>Vercel</b> hosts the app.</li>
        <li><b>Google Gemini</b> reads your photo to find the foods and estimate their nutrition.</li>
        <li><b>Payments</b> are processed by Whop through Kwop. We never see or store your card.</li>
        <li><b>Visit analytics by Kwop</b> on our public pages (home, sign-up, log-in), to count visits and sign-ups.</li>
      </ul>
      <p>We don&apos;t sell your data and we don&apos;t use your photos for advertising.</p>
      <h2>Delete your data</h2>
      <p>Delete one meal and its photo from the meal page. Delete everything from Account → Delete my account: your account, meals and photos are removed right away.</p>
      <h2>Not medical advice</h2>
      <p>Nutrition values are estimates from a photo. They are not medical advice.</p>
    </LegalPage>
  );
}
