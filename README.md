# Választási Bingó 2026

> Interaktív politikai bingó a 2026-os magyar választási kampányhoz.
> Hallgatod a közvetítést? Kattints a varázsszóra ha elhangzik!

🌐 **[valasztasibingo.hu](https://valasztasibingo.hu)**

---

## Mi ez?

A Választási Bingó 2026 egy ingyenes, mobilbarát webalkalmazás, amellyel
szórakoztatóan követheted a 2026-os magyarországi választási kampány közvetítéseit.
Ha elhangzik egy tipikus politikai varázsszó a táblán – kattints rá!
Gyűjts sort, oszlopot vagy átlót és érj el BINGÓ-t!

---

## Funkciók

- 🎮 **5×5 bingó tábla** – 63 aktuális politikai varázsszóval
- 🏆 **Élő ranglista** – versenyezz más játékosokkal
- 📰 **Politikai hírek** – Telex, 444, HVG cikkek szűrve
- 🎯 **Napi kihívás** – minden napra új feladat
- 📸 **Megosztás** – branded kép generálás, viral szövegek
- 📱 **PWA** – telepíthető mobilra, offline is működik
- 🔐 **Bejelentkezés** – Google fiókkal vagy névtelenül

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Stílus | Tailwind CSS 3 (Material Design 3) |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Vercel |
| Analytics | Umami (GDPR-kompatibilis, cookie-mentes) |
| PWA | Service Worker + Web App Manifest |

---

## Fejlesztési folyamat

### Fázis 1 – Alapok
React + Vite + Tailwind MD3 setup, 4 képernyős architektúra (Bingó, Közösség, Hírek, Beállítások), Supabase integráció, Google OAuth.

### Fázis 2 – Gameplay
5×5 bingó tábla, konfetti animáció, hangeffektek (Web Audio API), haptikus visszajelzés, LocalStorage persistens beállítások.

### Fázis 3 – Közösségi funkciók
Realtime leaderboard (Supabase channel), aktivitás feed, napi kihívás, Napi Bajnok kártya, TE badge.

### Fázis 4 – PWA és megosztás
manifest.json + Service Worker, valódi PNG ikonok (192×192, 512×512), Chrome install prompt, Canvas API branded share kép, viral szövegek, asztali PNG letöltés fallback.

### Fázis 5 – UI polish
3D bingó tábla (CSS gradient + shadow + transform), countdown bugfix (UTC), TopBar navigáció logika, "Hogyan játssz?" leírás.

### Fázis 6 – Tartalom és jog
63 szavas bingó szótár (2025–2026 kampány, botrányok, mémek), varázsszavak kinyitható lista, GDPR-kompatibilis jogi oldalak (adatvédelem/ÁSZF/adattörlés), LegalFooter minden képernyőn.

### Fázis 7 – Domain és OAuth
valasztasibingo.hu → Vercel, DNS beállítás, Facebook OAuth app (App Review folyamatban), TikTok/Instagram placeholder.

### Fázis 8 – Felhasználói funkciók
Névválasztó generált politikai nevekkel, profil szerkesztés.

### Fázis 9 – Analytics
Umami Analytics (cookie-mentes, GDPR), esemény tracking, Service Worker v2 (külső domainek bypass).

---

## Szótár – néhány varázsszó

`Brüsszel` `Szuverenitás` `Migráció` `Béke` `Gyurcsány` `Rezsi-csökkentés`
`Pálinkás százados` `Henry ügynök` `Gundalf` `Da-da-da` `PADME` `Százados`
`Feketeruhások` `Lázárinfó` `Hatvanpuszta` `Matolcsy-klán` `Ukrán kémek`
`Tisza Párt` `Magyar Péter` `Orbán Gáspár` `Csádi misszió` `Beköltözve`

és még 40+ szó...

---

## Jogi oldalak

- [Adatvédelmi nyilatkozat](https://valasztasibingo.hu/privacy)
- [Általános Szerződési Feltételek](https://valasztasibingo.hu/terms)
- [Adattörlési kérelem](https://valasztasibingo.hu/delete)

---

## Fejlesztő

**Gai Agent TechServices**
🌐 [gaiagent.cc](https://gaiagent.cc)
📧 gaiagent0@gmail.com

© 2026 Gai Agent TechServices – Minden jog fenntartva.

---

## Licensz

Ez a projekt szórakoztatási célú, nyílt forráskódú szoftver.
A tartalom szatirikus jellegű és nem minősül politikai propagandának.
