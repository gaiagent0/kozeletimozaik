export const BUZZWORDS = [
  "Brüsszel", "Szuverenitás", "Soros-terv", "Megállítjuk", "Dollárbaloldal",
  "Béke", "Migráció", "Rezsi-csökkentés", "Gyurcsány", "Folytatjuk",
  "Véleményem van", "Háborúpárti", "Keresztény értékek", "Reformok", "Szankciók",
  "Munka alapú", "Gender", "Infláció", "Előre megyünk", "Stabilitás",
  "Hungarikum", "Nemzeti konzultáció", "Elszámoltatás", "Külföldi ügynök", "Alaptörvény",
  "Mészáros", "EU-s pénzek", "Diktatúra", "Propaganda", "Európai értékek",
  "Vidéki Magyarország", "Példátlan", "Kétharmad", "Nemzeti érdek"
]

export const NEWS = [
  {
    id: 1,
    time: "Ma, 09:42",
    tag: "#brüsszel",
    tagColor: "bg-primary-fixed text-on-primary-fixed-variant",
    title: "Brüsszel újabb támadást indított a magyar rántott hús ellen",
    body: "A jelentések szerint az EU betiltaná a túl vastag panírt, hivatkozva az ökológiai lábnyomra. A Kormány válaszlépésként Nemzeti Panír-védelmi Tanácsot hoz létre.",
    reactions: ["sentiment_very_satisfied", "thumb_up"],
    color: "border-primary",
  },
  {
    id: 2,
    time: "Tegnap, 18:15",
    tag: "#rezsi",
    tagColor: "bg-secondary-container text-on-secondary-container",
    title: "Saját atommáglyát fejlesztenek a kistérségi polgármesterek",
    body: "A kísérleti program célja, hogy a közmunkások lelkesedéséből nyerjenek elegendő hőt a faluház fűtéséhez a téli szezonban.",
    reactions: [],
    reactionIcon: "local_fire_department",
    reactionCount: "154 láng",
    color: "border-secondary",
  },
  {
    id: 3,
    time: "Szerda, 11:20",
    tag: "#parlament",
    tagColor: "bg-white/20 text-white",
    title: "Új üléstrend: ezentúl csak kánonban lehet interpellálni",
    body: "A házelnök szerint a politikai viták akusztikai élménye jelentősen javulna, ha a képviselők tartánák a szolmizációs hangokat.",
    reactions: [],
    likes: 42,
    comments: 12,
    color: "border-outline",
  },
  {
    id: 4,
    time: "Kedd, 14:05",
    tag: "#szuverenitás",
    tagColor: "bg-secondary-container text-on-secondary-container",
    title: "Konzultáció indult a nemzeti tányéralap védelméről",
    body: "A kérdőívek szerint a megkérdezettek 94%-a határozottan ellenzi a külföldi kávéfőző-importot.",
    reactions: ["thumb_up"],
    likes: 88,
    color: "border-primary",
  },
]

export const LEADERBOARD = [
  { rank: 1, name: "István V.", points: 248, today: "+12", initials: "IV" },
  { rank: 2, name: "Katalin H.", points: 215, today: "+8", initials: "KH" },
  { rank: 3, name: "Balázs F.", points: 198, today: "+5", initials: "BF" },
  { rank: 4, name: "Mária S.", points: 176, today: "+3", initials: "MS" },
  { rank: 5, name: "Péter N.", points: 154, today: "+1", initials: "PN" },
]
