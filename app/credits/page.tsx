import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Photo credits" };

const PHOTOS = [
  { name: "Avocado toast", author: "Sarah Stierch", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", source: "https://commons.wikimedia.org/wiki/File:Avocado_toast_at_the_girl_%26_the_fig_-_Sarah_Stierch.jpg" },
  { name: "Poke bowl", author: "Andy Li", license: "CC0 1.0 (public domain)", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", source: "https://commons.wikimedia.org/wiki/File:Fried_Tofu_Poke_Bowl_(S)_with_kimchi_sauce_-_Kitokito.jpg" },
  { name: "Spaghetti and meatballs", author: "D. Laird from Riverside County, USA", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", source: "https://commons.wikimedia.org/wiki/File:Spaghetti_and_meatballs_on_plate.jpg" },
];

export default function Credits() {
  return (
    <LegalPage title="Photo credits" updated="November 26, 2026">
      <p>The example plates on our home page are real photos shared on Wikimedia Commons. Thank you to their photographers. They were cropped to a square.</p>
      <ul>
        {PHOTOS.map((p) => (
          <li key={p.name}>
            <b>{p.name}</b> by {p.author}, <a className="underline" href={p.licenseUrl} target="_blank" rel="noreferrer">{p.license}</a>, via{" "}
            <a className="underline" href={p.source} target="_blank" rel="noreferrer">Wikimedia Commons</a>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
