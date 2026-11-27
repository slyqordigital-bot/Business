import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="November 26, 2026">
      <p>Here is what SnackQuest keeps, why, and how to delete it. In short: your photos are private, we never sell your data, and you can delete everything at any time.</p>
      <h2>What we keep</h2>
      <ul>
        <li><b>Your email</b>, to give you an account.</li>
        <li><b>Your answers</b> (main game, snack, when you play, goal reward) and your gamer tag, to build your quests.</li>
        <li><b>Your quests and quest photos</b>, stored in a private space only your account can read.</li>
        <li><b>Usage</b>: points, play sessions, linked games and how many quests you cleared, for your plan&apos;s quotas.</li>
        <li><b>Your Steam id and public playtime</b>, only if you link Steam.</li>
        <li><b>Your shipping address</b>, only when you redeem gear, to send it.</li>
      </ul>
      <h2>Who processes your data</h2>
      <ul>
        <li><b>Supabase</b> stores your account, quests and photos.</li>
        <li><b>Vercel</b> hosts the app.</li>
        <li><b>Google Gemini</b> writes your quests and checks your quest photos.</li>
        <li><b>Steam Web API</b> provides public playtime if you link Steam.</li>
        <li><b>Payments</b> are processed by Whop through Kwop. We never see or store your card.</li>
        <li><b>Visit analytics by Kwop</b> on our public pages (home, sign-up, log-in), to count visits and sign-ups.</li>
      </ul>
      <p>We don&apos;t sell your data and we don&apos;t use your photos for advertising. A share link shows only your gamer tag, quest titles and points.</p>
      <h2>Delete your data</h2>
      <p>Remove a game or a quest anytime. Delete everything from Account → Delete my account: your account, points, quests and photos are removed right away.</p>
    </LegalPage>
  );
}
