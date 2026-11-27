import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms" };

export default function Terms() {
  return (
    <LegalPage title="Terms" updated="November 26, 2026">
      <p>By using SnackQuest you agree to these terms. They are short on purpose.</p>
      <h2>The service</h2>
      <p>SnackQuest turns snack breaks into quests and playtime into points. Quests are written by AI and checked from your photo by AI; a check can be wrong, so you can always retake the photo. Points have no cash value, can&apos;t be sold or transferred, and are only redeemed in the Reward Shop.</p>
      <h2>Game Sync, honestly</h2>
      <p>Websites can&apos;t read console, Epic or mobile games. Steam playtime is read from public Steam profiles through the Steam Web API. Other games count with the session timer while its tab stays open. Counted playtime is capped per day.</p>
      <h2>Rewards</h2>
      <p>When you redeem, the points are held right away and the SnackQuest team sends your reward: gift-card codes by email, gear to a US address, usually within 7 business days. You can cancel a request until it&apos;s processed and get your points back. Rewards and point costs can change; rewards you already requested are honored. Accounts that cheat (fake photos, timers running while not playing, multiple accounts) can lose their points.</p>
      <h2>Healthy fun</h2>
      <p>Quests are about normal snacks, never eating or drinking a lot. Skip any quest you don&apos;t want to do. Nothing in SnackQuest is medical or nutrition advice.</p>
      <h2>Plans and payments</h2>
      <p>Paid plans renew automatically each month or year until you cancel. Payments are processed by Whop through Kwop. Each plan includes a set number of quests per billing period, shown before you pay. Cancel anytime from Account → Billing; you keep your plan until the end of the period you paid for. Prices are in USD.</p>
      <h2>Not affiliated</h2>
      <p>SnackQuest is independent and isn&apos;t affiliated with Epic Games, Valve, Riot Games, Microsoft, Mojang, Roblox, Activision or any other publisher. Game names belong to their owners.</p>
      <h2>Changes</h2>
      <p>We may update SnackQuest and these terms. If a change matters, we&apos;ll tell you in the app before it applies.</p>
    </LegalPage>
  );
}
