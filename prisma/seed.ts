/**
 * Seed de la base Groupe ISI.
 *
 * Le contenu reprend celui du site new.groupeisi.com : paramètres, menus,
 * campus, départements, 23 formations, équipe, actualités (prisma/data/
 * actualites.json), témoignages, FAQ, alumni et documents.
 *   npm run db:seed
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, Niveau, PersonneType, PartenaireType, DocumentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const M = (f: string) => `/media/${f}`;
const IMG = {
  heroA: M("site-wet-en-ligne-at-2x-at-2x.jpg"),
  heroB: M("whatsapp-image-2026-07-14-at-16-49-01.jpeg"),
  heroC: M("site-web-fede-at-2x.jpg"),
  campusDakar: M("img-9163.jpg"),
  campusKM: M("km-1.jpg"),
  campusSuptech: M("isi-suptech.jpg"),
  campusDiourbel: M("img-2572-1-1320x880-1.jpg"),
  campusKaolack: M("28e3536d-dfb6-4619-92ef-528c4b7d-1.jpg"),
  campusZig: M("isi-zig-1008x675-1.jpeg"),
  campusSedhiou: M("isi-sedhiou-at-5x.png"),
  campusKaffrine: M("img-2024-1.jpg"),
  campusKomunik: M("mg-9698-cr3-at-2025-copie.jpg"),
  campusFass: M("img-2298-1.jpg"),
  campusIsi24: M("img-1923.jpg"),
  campusNkc: M("img-7737-cr3-at-2025.jpg"),
  campusNdb: M("img-9510-cr3-dxo-deepprimexd.jpg"),
  depGenieInfo: M("mg-0002-cr3-at-2025-at-2025-copie.jpg"),
  depReseaux: M("mg-0036-cr3-at-2025-at-2025-copie.jpg"),
  depGestion: M("mg-9698-cr3-at-2025-copie.jpg"),
  depData: M("mg-8766-cr3-at-2025-copie.jpg"),
  programme: M("mg-9941-cr3-at-2025-copie.jpg"),
  president: M("m-sambe.jpg"),
  dg: M("thierno-at-3x.jpg"),
  ibrahimaSy: M("ibrahima-sy-photo.jpg"),
  latyrNdiaye: M("fichier-2-at-4x.png"),
  morDiaw: M("fichier-1-at-4x.png"),
  eventGraduation: M("img-1714-1.jpg"),
  alumni1: M("alamni-team-1.jpg"),
  alumni2: M("alamni-team-2.jpg"),
  alumni3: M("alamni-team-3.jpg"),
  vie1: M("img-9996.jpg"),
  vie2: M("img-8811-cr3-dxo-deepprimexd-dxo-copie-2.jpg"),
  vie3: M("mg-8766-cr3-at-2025-copie.jpg"),
  vie4: M("mg-9699-cr3-at-2025-copie.jpg"),
  vie5: M("img-4035-1.jpg"),
  gal1: M("img-2024-1.jpg"),
  gal2: M("img-2298-1.jpg"),
  gal3: M("img-1923.jpg"),
  gal4: M("img-9253-cr3-dxo-deepprimexd-dxo.jpg"),
  gal5: M("mg-9941-cr3-at-2025.jpg"),
  gal6: M("mg-0028-cr3-at-2025-at-2025.jpg"),
  gal7: M("mg-0041-cr3-at-2025-at-2025-copie.jpg"),
  gal8: M("115b4b16-d1c6-48ec-8f15-04a6fdcc28de.jpg"),
  gal9: M("2271fbd1-afbd-4a3b-870a-559f662d5256.jpg"),
  gal10: M("7878c3fc-cbd7-4b73-9f7d-8558cf5c10d5.jpg"),
  gal11: M("45485852-1374-4fd4-b619-44e71db6c505.jpg"),
  gal12: M("37aceda0-ab90-4fdc-ba8c-a55c96f8adcd.jpg"),
  gal13: M("32ffbaab-eacd-4a77-be4f-021e07dda520.jpg"),
  sport1: M("16c01bd9-8efe-496d-887e-91f2d12d658b.jpg"),
  sport2: M("54cbd43d-3c8f-49e2-9f79-fbfe72fa2258.jpg"),
  sport3: M("mg-9700-cr3-at-2025.jpg"),
  sport4: M("img-6125.jpg"),
  sport5: M("4c7864df-d7a7-4fad-b65c-12012de93541.jpg"),
  sport6: M("f1d4b642-c446-4b7d-b970-32ceec515f63.jpg"),
  histoire2024: M("img-2247-1.jpg"),
  histoire2023: M("img-2033-1.jpg"),
  histoire2020: M("mg-0041-cr3-at-2025-at-2025.jpg"),
  histoire2019: M("img-1573.jpg"),
  histoire2018: M("mg-0035-cr3-at-2025-at-2025.jpg"),
  histoire2016: M("img-1714-1.jpg"),
  histoire2015: M("img-2377-1.jpg"),
  alumniGroupe: M("dsc-0071-1.jpg"),
  alumniGal1: M("dsc-0070-1.jpg"),
  alumniGal2: M("img-9226-cr3-dxo-deepprimexd-dxo.jpg"),
  aproposA: M("mg-9698-cr3-at-2025-copie.jpg"),
  aproposB: M("img-9163.jpg"),
  aproposC: M("img-2247-full.jpg"),
  aproposD: M("z3a6098-1.jpg"),
  librairie: M("img-8837-cr3-dxo-deepprime-dxo.jpg"),
  fraisFond: M("img-2024-1.jpg"),
};

type Article = {
  titre: string;
  slug: string;
  extrait: string;
  contenu: string;
  image: string | null;
  images: string[];
  publishedAt: string;
  categorie: string;
  tempsLecture: number;
};

async function main() {
  console.log("🌱 Seed Groupe ISI (contenu new.groupeisi.com)…");

  // -------------------------------------------------------------------------
  // Nettoyage (ordre respectant les clés étrangères)
  // -------------------------------------------------------------------------
  await prisma.eRPLog.deleteMany();
  await prisma.eRPMapping.deleteMany();
  await prisma.inscription.deleteMany();
  await prisma.post.deleteMany();
  await prisma.categorieActualite.deleteMany();
  await prisma.evenement.deleteMany();
  await prisma.personne.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.departement.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.alumni.deleteMany();
  await prisma.partenaire.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.document.deleteMany();
  await prisma.navigationItem.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  // -------------------------------------------------------------------------
  // Comptes d'administration
  // -------------------------------------------------------------------------
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@groupeisi.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@2026!";
  const admin = await prisma.user.create({
    data: { email: adminEmail, password: await bcrypt.hash(adminPassword, 12), nom: "Administrateur ISI", role: "SUPER_ADMIN" },
  });
  await prisma.user.create({
    data: { email: "communication@groupeisi.com", password: await bcrypt.hash("Editeur@2026!", 12), nom: "Service Communication", role: "EDITEUR" },
  });

  // -------------------------------------------------------------------------
  // Paramètres du site
  // -------------------------------------------------------------------------
  await prisma.siteSettings.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} });
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      siteName: "Groupe ISI",
      tagline: "Institut de référence dans les TIC",
      description:
        "Depuis plus de 27 ans, l'Institut Supérieur d'Informatique « ISI » s'engage dans la formation des jeunes cadres africains. L'ISI compte aujourd'hui 9 campus, réunissant plus de trente nationalités, et délivre des diplômes de Licence et de Master reconnus par l'ANAQ-Sup et le CAMES.",
      logoUrl: M("logo-isi.png"),
      logoWhiteUrl: M("sans-titre-1920-x-813-px-135-x-46-px-3.png"),
      logoFooterUrl: M("plan-de-travail-1.png"),
      faviconUrl: M("design-sans-titre.png"),
      email: "contact@groupeisi.com",
      emailAdmissions: "contact@groupeisi.com",
      phone: "+221 76 664 85 44",
      phone2: "+221 33 822 19 81",
      whatsapp: "+221 76 664 85 44",
      address: "Km1 Avenue Cheikh Anta Diop, en face Police 4e – Dakar",
      horaires: "Lundi – Vendredi : 8h – 18h · Samedi : 9h – 13h",
      facebook: "https://www.facebook.com/GroupeISI/",
      instagram: "https://www.instagram.com/groupeisi",
      linkedin: "https://www.linkedin.com/school/groupe-isi/",
      youtube: "https://www.youtube.com/c/GROUPEISI-TV",
      twitter: "https://twitter.com/groupeisi?lang=fr",
      tiktok: "https://www.tiktok.com/@groupeisi",
      heroTitle: "Institut de référence dans les TIC",
      heroSubtitle:
        "Licences, Bachelors et Masters en informatique, réseaux, data science et management — 9 campus au Sénégal et en Mauritanie.",
      heroCtaLabel: "Préinscription",
      heroCtaHref: "/preinscription",
      heroSlides: [IMG.heroA, IMG.heroB, IMG.heroC],
      heroVideoUrl: "https://www.youtube.com/watch?v=dnJa4EDaoh8",
      playStoreUrl: null,
      appStoreUrl: null,
      annonceBandeau: null,
      annonceLien: null,
      statAnnees: 27,
      statEtudiants: 2000,
      statCampus: 9,
      statProgrammes: 23,
      statInsertion: 87,
      statPartenaires: 20,
      seoTitle: "Groupe ISI – Institut de référence dans les TIC",
      seoDescription:
        "Groupe ISI : licences, bachelors et masters en génie logiciel, réseaux, cybersécurité, data science et management. Diplômes reconnus ANAQ-Sup et CAMES, 9 campus au Sénégal et en Mauritanie.",
      seoKeywords:
        "ISI, Institut Supérieur d'Informatique, Dakar, formation informatique, licence génie logiciel, master data science, école informatique Sénégal",
      ogImage: IMG.campusDakar,
      inscriptionsOuvertes: true,
      anneeAcademique: "2026-2027",
      rentreeOptions: ["Octobre 2026", "Janvier 2027", "Mars 2027"],
    },
  });

  // -------------------------------------------------------------------------
  // Campus (9 campus + annexes, coordonnées de la page « Localisation »)
  // -------------------------------------------------------------------------
  const campusData = [
    {
      nom: "ISI DAKAR",
      slug: "isi-dakar",
      ville: "Dakar",
      zone: "Dakar",
      adresse: "Km1 Avenue Cheikh Anta Diop, en face Police 4e – Dakar",
      telephone: "+221 33 822 19 81",
      email: "contact@groupeisi.com",
      image: IMG.campusDakar,
      images: [IMG.gal2, IMG.gal4, IMG.sport3],
      isSiege: true,
      description:
        "ISI Dakar est le campus mère du Groupe ISI. Il comporte en plus du campus siège (ISI Mère) deux annexes : le campus annexe Fass (ISI Fass) et le campus annexe siège (ISI24). Ces 3 campus se partagent plus de 1500 étudiants qui constituent la grande famille isi dakarienne.",
      contenu:
        "<p>L'Institut Supérieur d'Informatique (ISI) trouve ses origines en 1988, sous l'appellation JET INFORMATIQUE, une initiative visionnaire portée par de jeunes étudiants de l'Université Cheikh Anta Diop de Dakar, en collaboration avec leurs homologues de l'Université Laval, au Québec (Canada).</p><p>Initialement spécialisée dans la consultation informatique, la formation technique, la maintenance et la vente de matériel informatique, JET INFORMATIQUE était avant tout une structure commerciale tournée vers la promotion des technologies. Très rapidement, face à la demande croissante en compétences numériques qualifiantes, elle évolue naturellement vers la formation professionnelle.</p><p>Entre 1991 et 1996, l'ISI lance ses premiers programmes académiques en informatique et en gestion, affirmant ainsi sa vocation d'établissement d'enseignement supérieur. En 1999, l'ISI franchit une nouvelle étape en lançant son premier programme d'ingénieur en techniques informatiques, désormais intégré au système LMD (Licence – Master – Doctorat), aligné sur les standards internationaux.</p><p>Aujourd'hui, ISI est reconnu comme le leader de la formation en informatique au Sénégal, fort d'une expérience de plus de 30 ans, d'un réseau de plus de 30 000 diplômés à travers le monde, et d'un maillage national et international grâce à ses nombreux campus.</p>",
      latitude: 14.686389,
      longitude: -17.454729,
      mapEmbedUrl:
        "https://maps.google.com/maps?q=14.686388982114329%2C%20-17.45472877323827&t=m&z=15&output=embed&iwloc=near",
      directeurNom: "Thierno Birahime Sambe",
      directeurPoste: "Directeur Général",
      directeurPhoto: IMG.dg,
      mission: [
        "Former des cadres opérationnels dans les métiers du numérique",
        "Accompagner l'insertion professionnelle de chaque diplômé",
        "Contribuer à la transformation digitale du Sénégal et de la sous-région",
      ],
      vision: [
        "Une offre de formation diversifiée dans les métiers d'avenir",
        "Une innovation permanente des programmes",
        "Des résultats de premier plan aux examens et concours",
      ],
      statCampus: 3,
      statDepartements: 3,
      statFormations: 18,
      statEtudiants: "1500 +",
      equipements: ["Laboratoires réseaux Cisco", "Laboratoire Huawei", "Amphithéâtres", "Bibliothèque", "Espace coworking"],
    },
    {
      nom: "ISI KEUR MASSAR",
      slug: "isi-km",
      ville: "Keur Massar",
      zone: "Dakar",
      adresse: "Keur Massar – Dakar",
      telephone: "+221 76 664 85 44",
      email: "ndiouf@groupeisi.com",
      image: IMG.campusKM,
      description:
        "Le campus de Keur Massar accueille les étudiants de la banlieue dakaroise dans un cadre moderne, avec les mêmes programmes et la même exigence pédagogique que le campus siège.",
      latitude: 14.785878,
      longitude: -17.288097,
      mapEmbedUrl:
        "https://maps.google.com/maps?q=14.785878430696805%2C%20-17.288097073236834&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques", "Laboratoire réseaux", "Bibliothèque"],
    },
    {
      nom: "ISI SUPTECH",
      slug: "isi-spt",
      ville: "Dakar",
      zone: "Dakar",
      adresse: "Allées Khalifa Ababacar Sy – Dakar",
      telephone: "+221 76 664 85 44",
      email: "ksamb@groupeisi.com",
      image: IMG.campusSuptech,
      description:
        "ISI SupTech propose des formations technologiques et professionnalisantes au cœur de Dakar, avec un accompagnement renforcé vers l'emploi.",
      mapEmbedUrl:
        "https://maps.google.com/maps?q=PG9V%2BJC2%2C%20Allees%20Khalifa%20Ababacar%20Sy%2C%20Dakar&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques", "Ateliers pratiques"],
    },
    {
      nom: "ISI DIOURBEL",
      slug: "isi-db",
      ville: "Diourbel",
      zone: "Régions",
      adresse: "580, N3 – Diourbel",
      telephone: "+221 76 664 85 44",
      email: "mndiaye@groupeisi.com",
      image: IMG.campusDiourbel,
      description: "Le campus de Diourbel dessert la région du Baol et propose les filières informatiques et de gestion du Groupe ISI.",
      mapEmbedUrl: "https://maps.google.com/maps?q=580%2C%20N3%2C%20Diourbel&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques", "Bibliothèque"],
    },
    {
      nom: "ISI KAOLACK",
      slug: "isi-kl",
      ville: "Kaolack",
      zone: "Régions",
      adresse: "Kaolack",
      telephone: "+221 76 664 85 44",
      email: "atraore@groupeisi.com",
      image: IMG.campusKaolack,
      description: "Au cœur du bassin arachidier, ISI Kaolack forme les techniciens et cadres du numérique de la région.",
      mapEmbedUrl: "https://maps.google.com/maps?q=5W58%2B95P%2C%20Kaolack&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques", "Laboratoire réseaux"],
    },
    {
      nom: "ISI KAFFRINE",
      slug: "isi-kf",
      ville: "Kaffrine",
      zone: "Régions",
      adresse: "Kaffrine",
      telephone: "+221 76 664 85 44",
      email: "bandiaye1@groupeisi.com",
      image: IMG.campusKaffrine,
      description: "ISI Kaffrine rapproche l'offre de formation supérieure en informatique des étudiants du centre du pays.",
      latitude: 14.103902,
      longitude: -15.55094,
      mapEmbedUrl:
        "https://maps.google.com/maps?q=14.10390220568031%2C%20-15.550940475098823&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques"],
    },
    {
      nom: "ISI ZIGUINCHOR",
      slug: "isi-zg",
      ville: "Ziguinchor",
      zone: "Régions",
      adresse: "Ziguinchor",
      telephone: "+221 76 664 85 44",
      email: "adiop@groupeisi.com",
      image: IMG.campusZig,
      description: "Le campus de Ziguinchor accompagne les bacheliers de la Casamance vers les métiers du numérique.",
      mapEmbedUrl: "https://maps.google.com/maps?q=HPQH%2B36%2C%20Ziguinchor&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques", "Bibliothèque"],
    },
    {
      nom: "ISI SEDHIOU",
      slug: "isi-sdh",
      ville: "Sédhiou",
      zone: "Régions",
      adresse: "Sédhiou",
      telephone: "+221 76 664 85 44",
      email: "pmane@groupeisi.com",
      image: IMG.campusSedhiou,
      description: "Dernier campus ouvert par le Groupe ISI, ISI Sédhiou étend le maillage de l'institut en Casamance.",
      mapEmbedUrl: "https://maps.google.com/maps?q=S%C3%A9dhiou&t=m&z=15&output=embed&iwloc=near",
      equipements: ["Salles informatiques"],
    },
    {
      nom: "ISI KOMUNIK",
      slug: "isi-kom",
      ville: "Dakar",
      zone: "Dakar",
      adresse: "Dakar",
      telephone: "+221 76 664 85 44",
      email: "contact@groupeisi.com",
      image: IMG.campusKomunik,
      description: "ISI Komunik est le pôle dédié aux métiers de la communication digitale et du multimédia.",
      equipements: ["Studio multimédia", "Salles informatiques"],
    },
    {
      nom: "ISI Fass (annexe)",
      slug: "isi-fass",
      ville: "Dakar",
      zone: "Annexes",
      adresse: "Bd de Ziguinchor, Dakar 28110",
      email: "contact@groupeisi.com",
      image: IMG.campusFass,
      description: "Campus annexe de Fass, rattaché au campus siège de Dakar.",
      mapEmbedUrl: "https://maps.google.com/maps?q=Bd%20de%20Ziguinchor%2C%20Dakar%2028110&t=m&z=15&output=embed&iwloc=near",
    },
    {
      nom: "ISI24 (annexe siège)",
      slug: "isi-24",
      ville: "Dakar",
      zone: "Annexes",
      adresse: "Dakar",
      email: "contact@groupeisi.com",
      image: IMG.campusIsi24,
      description: "Campus annexe du siège, dédié aux cours du soir et à la formation continue.",
      mapEmbedUrl: "https://maps.google.com/maps?q=MGPW%2BF3V%2C%20Dakar&t=m&z=15&output=embed&iwloc=near",
    },
    {
      nom: "ISI Nouakchott",
      slug: "isi-nouakchott",
      ville: "Nouakchott",
      pays: "Mauritanie",
      zone: "Mauritanie",
      adresse: "Nouakchott, Mauritanie",
      email: "aldiop@groupeisi.com",
      image: IMG.campusNkc,
      description: "Première implantation du Groupe ISI en Mauritanie, le campus de Nouakchott forme des cadres du numérique.",
      mapEmbedUrl: "https://maps.google.com/maps?q=32X8%2BMX9%2C%20Nouakchott%2C%20Mauritanie&t=m&z=15&output=embed&iwloc=near",
    },
    {
      nom: "ISI Nouadhibou",
      slug: "isi-nouadhibou",
      ville: "Nouadhibou",
      pays: "Mauritanie",
      zone: "Mauritanie",
      adresse: "Nouadhibou, Mauritanie",
      email: "contact@groupeisi.com",
      image: IMG.campusNdb,
      description: "Le campus de Nouadhibou accompagne le développement économique du nord de la Mauritanie.",
      mapEmbedUrl: "https://maps.google.com/maps?q=WXM7%2BHMQ%2C%20Nouadhibou%2C%20Mauritanie&t=m&z=15&output=embed&iwloc=near",
    },
  ];

  /* Ordre d'affichage repris de la page d'accueil du site. */
  const ORDRE_AFFICHAGE = ["isi-sdh", "isi-dakar", "isi-km", "isi-spt", "isi-db", "isi-kl", "isi-kf", "isi-zg", "isi-kom"];
  const ordreDe = (slug: string) => {
    const i = ORDRE_AFFICHAGE.indexOf(slug);
    return i === -1 ? ORDRE_AFFICHAGE.length + campusData.findIndex((c) => c.slug === slug) : i;
  };
  const campus: Record<string, { id: string }> = {};
  for (const c of campusData) {
    campus[c.slug] = await prisma.campus.create({
      data: { pays: "Sénégal", ...c, ordre: ordreDe(c.slug), erpCode: `CAMP-${c.slug.toUpperCase().replace(/-/g, "_")}` },
    });
  }
  const allCampusIds = ["isi-dakar", "isi-km", "isi-spt", "isi-db", "isi-kl", "isi-kf", "isi-zg", "isi-sdh", "isi-kom"].map((s) => ({ id: campus[s].id }));
  const dakarOnly = [{ id: campus["isi-dakar"].id }];
  const dakarEtKm = [{ id: campus["isi-dakar"].id }, { id: campus["isi-km"].id }, { id: campus["isi-spt"].id }];

  // -------------------------------------------------------------------------
  // Départements
  // -------------------------------------------------------------------------
  const depData = [
    {
      nom: "Département Génie informatique",
      slug: "department-genie-informatique",
      icone: "Code2",
      couleur: "#07294D",
      image: IMG.depGenieInfo,
      email: "emdiaw@groupeisi.com",
      telephone: "+221 76 664 85 44",
      accroche: "Concevoir les systèmes d'information et les applications de demain",
      description:
        "Le département du Génie Informatique forme les étudiants dans la conception des systèmes d'information, le développement de logiciels, d'applications informatiques, le multimédia et la géomatique, faisant partie de notre quotidien et en réglant des problèmes de gestion de l'information grâce à des solutions avantageuses et ingénieuses.",
      contenu:
        "<p>Le département Génie Informatique est le cœur historique du Groupe ISI. Il propose des parcours complets de la Licence au Master en génie logiciel, développement d'applications, infographie et multimédia, géomatique, systèmes embarqués et sécurité des systèmes d'information.</p><p>Les enseignements sont organisés en cours magistraux, travaux dirigés, travaux pratiques, séminaires spécialisés, visites en entreprise et projets tutorés.</p>",
    },
    {
      nom: "Département Réseaux et Systèmes",
      slug: "department-of-computer-engineering",
      icone: "Network",
      couleur: "#003A65",
      image: IMG.depReseaux,
      email: "contact@groupeisi.com",
      telephone: "+221 76 664 85 44",
      accroche: "Concevoir, sécuriser et administrer les infrastructures numériques",
      description:
        "Le Département Réseaux et Systèmes forme des professionnels capables de concevoir, sécuriser et administrer des réseaux de données LAN, WAN et WLAN. Les diplômés maîtrisent les technologies de virtualisation, la gestion de serveurs et la mutualisation de services dans le Cloud, leur permettant de proposer des solutions réseau fiables et innovantes aux entreprises et opérateurs.",
      contenu:
        "<p>Le département est <strong>Académie Cisco</strong> et <strong>Académie Huawei</strong>. Il prépare aux métiers d'administrateur réseaux et systèmes, d'ingénieur télécoms, d'expert cybersécurité et d'ingénieur cloud.</p>",
    },
    {
      nom: "Département Gestion et Management",
      slug: "department-of-business-administration",
      icone: "Briefcase",
      couleur: "#dd9f33",
      image: IMG.depGestion,
      email: "contact@groupeisi.com",
      telephone: "+221 76 664 85 44",
      accroche: "Piloter la performance, optimiser les ressources, manager les équipes",
      description:
        "Du Bachelor au Master, nos formations professionnalisantes préparent aux fonctions à responsabilité et affichent un fort taux d'insertion. Diplômes reconnus par l'ANAQ-Sup et le CAMES.",
      contenu:
        "<p>Le département propose des filières en Banque-Finance-Assurance, Commerce International, Finance et Comptabilité, Marketing et Communication digitale et Assistanat de direction.</p>",
    },
    {
      nom: "Département Intelligence Artificielle et Ingénierie des Données",
      slug: "department-of-data-science",
      icone: "BrainCircuit",
      couleur: "#0e7490",
      image: IMG.depData,
      email: "ibsy@groupeisi.com",
      telephone: "+221 77 313 00 67",
      accroche: "Exploiter la donnée et l'intelligence artificielle",
      description:
        "Le département Intelligence Artificielle et Ingénierie des Données (IAID) se concentre sur la formation et la recherche dans les domaines de l'intelligence artificielle (IA) et de l'ingénierie des données, des disciplines au cœur de la transformation numérique actuelle.",
      contenu:
        "<p>Le département anime le Bachelor en Data Science &amp; Big Data, le Master en Data Science et Intelligence artificielle et le Master MIAGE.</p>",
    },
  ];
  const dep: Record<string, { id: string }> = {};
  for (const [i, d] of depData.entries()) dep[d.slug] = await prisma.departement.create({ data: { ...d, ordre: i } });

  const GI = "department-genie-informatique";
  const RS = "department-of-computer-engineering";
  const GM = "department-of-business-administration";
  const DS = "department-of-data-science";

  // -------------------------------------------------------------------------
  // Formations (23 programmes du site)
  // -------------------------------------------------------------------------
  const PORTFOLIO = "https://portfolio-mgl.groupeisi.com/programme/";
  type P = {
    titre: string;
    slug: string;
    niveau: Niveau;
    dep: string;
    duree: string;
    semestres: number;
    credits: number;
    volumeHoraire: number;
    nbUE: number;
    description: string;
    accroche?: string;
    objectifs?: string[];
    debouches?: string[];
    unitesEnseignement?: { intitule: string; contenu?: string }[];
    structure?: string;
    fraisScolarite?: number;
    fraisInscription?: number;
    fraisMensualite?: number;
    isFeatured?: boolean;
    campusIds?: { id: string }[];
  };

  const STRUCT_6 =
    "Les enseignements sont organisés en cours magistraux, travaux dirigés (TD), travaux pratiques (TP), séminaires spécialisés, visite en entreprise et projet pour une durée de trois ans répartis sur 6 semestres. Chaque semestre est composé de 15 semaines dont : trois (3) semaines d'évaluation et douze (12) semaines d'enseignement.";
  const STRUCT_4 =
    "Les enseignements sont organisés en cours magistraux, travaux dirigés (TD), travaux pratiques (TP), séminaires spécialisés, visite en entreprise et projet pour une durée de deux ans répartis sur 4 semestres. Chaque semestre est composé de 15 semaines dont : trois (3) semaines d'évaluation et douze (12) semaines d'enseignement.";

  const programmes: P[] = [
    {
      titre: "Master en Génie Logiciel",
      slug: "master-genie-logiciel",
      niveau: "MASTER",
      dep: GI,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 14,
      isFeatured: true,
      accroche: "Excellence en architecture et ingénierie logicielle",
      description:
        "Le Master professionnel en génie logiciel vise à former des professionnels compétents, bien préparés techniquement et capables de s'adapter à un environnement professionnel exigeant, dans lequel l'innovation et la qualité des logiciels sont essentielles pour répondre aux besoins de l'industrie moderne.",
      objectifs: [
        "Excellence en architecture et ingénierie logicielle",
        "Développer, tester et optimiser les systèmes logiciels",
        "Expertise en codage, conception et innovation",
      ],
      debouches: ["Architecte logiciel", "Chef de projet informatique", "Ingénieur DevOps", "Lead developer"],
      unitesEnseignement: [
        { intitule: "Développement d'application", contenu: "Conception logicielle, Développement Web, Programmation Orientée Objet, Architectures applicatives." },
        { intitule: "Ingénierie logicielle", contenu: "Gestion de projet agile, Cycle de vie du logiciel, Tests et Qualité logicielle, DevOps et CI/CD." },
        { intitule: "Développement mobile et embarqué", contenu: "Développement iOS/Android, Systèmes embarqués, Internet des Objets (IoT), Optimisation des ressources." },
        { intitule: "Système d'Informations et Base de données", contenu: "Bases de données relationnelles et NoSQL, Modélisation SI, Administration de bases de données, Big Data." },
        { intitule: "Réseaux Informatiques", contenu: "Protocole TCP/IP, Sécurité réseau, Administration système, Cloud Computing." },
        { intitule: "Connaissances Générales", contenu: "Anglais technique, Communication d'entreprise, Droit du numérique, Éthique des technologies." },
        { intitule: "Professionnalisation", contenu: "Projet tutoré, Stage en entreprise, Gestion de carrière, Entrepreneuriat." },
      ],
      structure:
        "Le programme de master en Génie logiciel de 4 semestres suit généralement une structure répartie sur quatre trimestres universitaires. " + STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarEtKm,
    },
    {
      titre: "Master en Data Science et Intelligence artificielle",
      slug: "master-data-science-intelligence-artificielle",
      niveau: "MASTER",
      dep: DS,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 14,
      isFeatured: true,
      accroche: "Former des Data Scientists capables de déployer des solutions d'IA à fort impact",
      description:
        "Le Master en Data Science et Intelligence Artificielle (DSIA) est un programme innovant qui prépare des experts capables d'exploiter la puissance des données et de l'intelligence artificielle pour répondre aux défis économiques, scientifiques et technologiques contemporains. Cette formation associe approches théoriques avancées et applications pratiques pour développer des compétences recherchées dans les domaines du Big Data, du Machine Learning et des systèmes intelligents.",
      objectifs: [
        "Collecter, traiter et analyser des données massives (Big Data) issues de sources variées.",
        "Concevoir et optimiser des modèles d'apprentissage automatique et de Deep Learning.",
        "Mettre en place des Data Pipelines performants et industrialiser les solutions IA avec des pratiques de MLOps.",
      ],
      debouches: ["Data Scientist", "Ingénieur Machine Learning", "Data Engineer", "Consultant IA"],
      unitesEnseignement: [
        { intitule: "Fondamentaux mathématiques pour la data science" },
        { intitule: "Logiciels et programmation" },
        { intitule: "Outils d'entreprise" },
        { intitule: "Développement web et framework" },
        { intitule: "Machine learning et environnement Data science" },
        { intitule: "Deep learning" },
        { intitule: "Containerisation, testing et déploiement dans le cloud" },
      ],
      structure:
        "Le programme de master en Data Science et Intelligence Artificielle de 4 semestres suit généralement une structure répartie sur quatre trimestres universitaires. " + STRUCT_4,
      fraisScolarite: 1605000,
      fraisInscription: 255000,
      fraisMensualite: 150000,
      campusIds: dakarOnly,
    },
    {
      titre: "Licence Professionnelle en Réseaux Informatiques",
      slug: "licence-reseaux-informatiques",
      niveau: "LICENCE",
      dep: RS,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 600,
      nbUE: 8,
      isFeatured: true,
      accroche: "Concevoir, paramétrer et administrer des réseaux de données IP",
      description:
        "Le programme de licence, de la spécialité réseaux informatiques a été conçu suivant les besoins et les exigences des entreprises publiques et privées. Il a pour objectif principal de former des techniciens et spécialistes capables de concevoir, de paramétrer et d'administrer des réseaux de données de type IP utilisant les technologies LAN, WAN et WLAN.",
      objectifs: [
        "Conception et administration des réseaux IP",
        "Interconnexion (routage et commutation) de réseaux IP",
        "Administration réseaux sous Linux et Windows, administration systèmes",
        "Sécurité des réseaux et systèmes informatiques, qualité de service sur les réseaux IP",
        "Développement d'applications client/serveur",
      ],
      debouches: ["Administrateur réseaux", "Technicien support systèmes et réseaux", "Ingénieur d'exploitation"],
      unitesEnseignement: [
        { intitule: "PLA : Programmation et Langages" },
        { intitule: "RAR : Réseaux et Architecture" },
        { intitule: "ARS : Administration Réseaux et Systèmes" },
        { intitule: "EMA : Électronique et Maintenance" },
        { intitule: "SIN : Système d'Information" },
        { intitule: "CCI : Cloud Computing et IoT" },
        { intitule: "CGE : Connaissances Générales" },
        { intitule: "PRO : Professionnalisation" },
      ],
      structure: "Le programme de Réseaux informatiques de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Bachelor en Data Science & Big Data",
      slug: "bachelor-data-science-big-data",
      niveau: "BACHELOR",
      dep: DS,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      isFeatured: true,
      accroche: "Analyser et valoriser les données massives",
      description:
        "Le Bachelor en Data Science et Big Data (DSBD) est une formation d'excellence qui prépare les étudiants à relever les défis de la transformation numérique en maîtrisant l'exploitation des données massives et les technologies modernes. Cette formation développe des compétences dans les domaines de la Data Analysis, du Machine Learning, de l'ingénierie des données, du Cloud Computing, ainsi que dans le développement d'applications intelligentes.",
      objectifs: [
        "Analyser et traiter des données complexes grâce aux techniques de Data Science et Big Data",
        "Concevoir et déployer des pipelines de données performants et sécurisés",
        "Développer des modèles de Machine Learning et les intégrer dans des applications intelligentes.",
      ],
      debouches: ["Data Analyst", "Développeur data", "Assistant Data Scientist"],
      unitesEnseignement: [
        { intitule: "Mathématiques Fondamentales", contenu: "Algèbre I, Analyse I" },
        { intitule: "Fondamentaux de la Programmation", contenu: "Algorithmique et structures de données I, Langage C I, Technologies Web (HTML, CSS, Framework CSS)" },
        { intitule: "Statistiques et Probabilités", contenu: "Dénombrement et probabilités I, Statistique descriptive I" },
        { intitule: "Informatique Systémique et Bases de Données", contenu: "Architecture des ordinateurs I, Fondements des bases de données et modèle relationnel, Systèmes d'exploitation (Windows) I" },
      ],
      structure: "Le Bachelor en Data Science et Big Data prépare les étudiants à relever les défis de la transformation numérique. " + STRUCT_6,
      fraisScolarite: 1055000,
      fraisInscription: 255000,
      fraisMensualite: 100000,
      campusIds: dakarOnly,
    },
    {
      titre: "Licence Professionnelle en Génie Logiciel",
      slug: "licence-genie-logiciel",
      niveau: "LICENCE",
      dep: GI,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      isFeatured: true,
      accroche: "Maîtriser l'ensemble du cycle de développement logiciel",
      description:
        "Former des professionnels maîtrisant l'ensemble du cycle de développement logiciel : analyse, conception, implémentation, tests et maintenance d'applications de qualité essentielles pour répondre aux besoins de l'industrie moderne.",
      objectifs: [
        "Analyser et concevoir des applications informatiques",
        "Tester, déployer et maintenir des applications",
        "Faire le versioning des applications",
      ],
      debouches: ["Développeur full-stack", "Développeur mobile", "Analyste programmeur"],
      unitesEnseignement: [
        { intitule: "Algorithmique et Langage" },
        { intitule: "Mathématiques appliquées" },
        { intitule: "Réseaux et Système" },
        { intitule: "Technologies Web et Base de Données" },
        { intitule: "Architecture et Système" },
        { intitule: "Technologies Web" },
        { intitule: "Réseaux Informatiques" },
      ],
      structure: "Le programme de licence en Génie logiciel de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Licence Professionnelle en Cybersécurité",
      slug: "licence-cybersecurite",
      niveau: "LICENCE",
      dep: RS,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 3600,
      nbUE: 9,
      accroche: "Protéger les systèmes d'information contre les menaces",
      description:
        "Les systèmes informatiques et télécommunications apportent aujourd'hui une dimension nouvelle à notre société avec des enjeux technologiques, économiques, culturels et sociologiques. À cet effet, les failles de sécurité des systèmes d'information, les cyberattaques et les menaces en ligne continuent de se multiplier et participent à la vulnérabilité des organisations partout dans le monde. La demande pour les professionnels de la cybersécurité et de la cyberdéfense est en forte augmentation.",
      objectifs: [
        "Mécanismes de sécurité et de défense",
        "Politique de sécurité des systèmes d'information et sécurisation des SI",
        "Analyse des malwares, sécurisation des applications et réseaux",
        "Interconnexion de réseaux IP, administration réseaux sous Linux et Windows",
      ],
      debouches: ["Analyste SOC", "Pentester", "Administrateur sécurité", "Consultant cybersécurité"],
      unitesEnseignement: [
        { intitule: "PLA : Programmation et Langage" },
        { intitule: "OLA : Optimisation et Langage" },
        { intitule: "RSY : Réseaux et Systèmes" },
        { intitule: "AMA : Architecture et Maintenance" },
        { intitule: "CSI : Cybersécurité Informatique" },
        { intitule: "SIN : Système d'Information" },
        { intitule: "CGE : Connaissances Générales" },
        { intitule: "PRO : Professionnalisation" },
        { intitule: "GCY : Gouvernance de la Cybersécurité" },
      ],
      structure:
        "Le programme de licence professionnelle en Cybersécurité s'adresse aux étudiants titulaires du baccalauréat ou tout autre diplôme admis en équivalence. La formation dispensée est répartie sur six (6) semestres d'études pour un volume horaire total de 3600 heures.",
      fraisScolarite: 1155000,
      fraisInscription: 255000,
      fraisMensualite: 100000,
      campusIds: dakarEtKm,
    },
    {
      titre: "Licence professionnelle en Infographie et Multimédia",
      slug: "licence-infographie-multimedia",
      niveau: "LICENCE",
      dep: GI,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Créer et gérer des contenus graphiques et multimédias",
      description:
        "L'objectif principal d'une Licence en Infographie et Multimédia est de former des professionnels capables de concevoir, de créer et de gérer des contenus graphiques et multimédias dans divers domaines tels que le design graphique, l'animation, la création de sites web, la réalité virtuelle, les jeux vidéo, la publicité, le cinéma, la télévision, et bien d'autres encore.",
      debouches: ["Infographiste", "Motion designer", "Web designer", "Monteur vidéo"],
      unitesEnseignement: [
        { intitule: "Algorithmique et Langage" },
        { intitule: "Infographie et Pratique audiovisuelle" },
        { intitule: "Culture technologique" },
        { intitule: "Technologie Web et Modélisation 3D" },
        { intitule: "Infographie" },
        { intitule: "Montage vidéo et Photographie" },
        { intitule: "Développement Multimédia" },
      ],
      structure: "Le programme de licence en Infographie et Multimédia de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: dakarEtKm,
    },
    {
      titre: "Licence professionnelle en Géomatique et développement d'applications",
      slug: "licence-geomatique-developpement-applications",
      niveau: "LICENCE",
      dep: GI,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Collecter, analyser et représenter des données géospatiales",
      description:
        "L'objectif principal de la Licence en Géomatique et développement d'applications est de former des professionnels compétents dans le domaine de la géomatique, en mettant l'accent sur le développement d'applications géospatiales. La géomatique est un domaine multidisciplinaire qui intègre la géographie, l'informatique et les sciences de la terre pour collecter, gérer, analyser et représenter des données géospatiales.",
      debouches: ["Géomaticien", "Développeur SIG", "Technicien topographe"],
      unitesEnseignement: [
        { intitule: "Algorithme et Langage (ALA)" },
        { intitule: "Architecture et système (ASY)" },
        { intitule: "Système d'Information et base de données (SGBD)" },
        { intitule: "Mathématiques Appliquées (MAP)" },
        { intitule: "Connaissances générales (CGE)" },
        { intitule: "Technologies de la géomatique (TGE)" },
        { intitule: "Réseaux et système (RSI)" },
      ],
      structure: "Le programme de licence en Géomatique et Développement d'applications de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: dakarOnly,
    },
    {
      titre: "Licence professionnelle en informatique appliquée à la gestion d'entreprise",
      slug: "licence-iage",
      niveau: "LICENCE",
      dep: GI,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "L'informatique au service de la gestion d'entreprise",
      description:
        "L'objectif principal de la licence en Informatique Appliquée à la Gestion des Entreprises est de former des professionnels capables de comprendre et d'exploiter les technologies de l'information et de la communication dans un contexte de gestion d'entreprise.",
      debouches: ["Assistant chef de projet SI", "Développeur d'applications de gestion", "Analyste fonctionnel"],
      unitesEnseignement: [
        { intitule: "Algorithme et Langage (ALA)" },
        { intitule: "Architecture et système (ASY)" },
        { intitule: "Système d'Information et base de données (SIBD)" },
        { intitule: "Mathématiques et techniques quantitatives de gestion (MTQG)" },
        { intitule: "Management des organisations (MOR)" },
        { intitule: "Communication (COM)" },
        { intitule: "Réseaux et système (RSY)" },
      ],
      structure: "Le programme de licence IAGE de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Licence Professionnelle en Systèmes Embarqués & IoT",
      slug: "licence-systemes-embarques-iot",
      niveau: "LICENCE",
      dep: GI,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 9,
      accroche: "Informatique embarquée, automatisation et objets connectés",
      description:
        "L'objectif de ce programme est de former, en trois ans après le baccalauréat, des compétences capables de seconder des ingénieurs dans le domaine de l'informatique embarquée, de l'automatisation et le contrôle des procédés industriels.",
      objectifs: [
        "La microinformatique embarquée dans un objet mobile",
        "La conception et la réalisation des systèmes embarqués",
        "La programmation de cartes électroniques à base de microprocesseurs ou de microcontrôleurs",
        "L'automatisation et le contrôle des procédés industriels",
      ],
      debouches: ["Technicien systèmes embarqués", "Développeur IoT", "Automaticien"],
      unitesEnseignement: [
        { intitule: "PLA : Programmation et Langage" },
        { intitule: "OLA : Optimisation et langage" },
        { intitule: "RSY : Réseaux et Systèmes" },
        { intitule: "CGE : Connaissances Générales" },
        { intitule: "PRO : Professionnalisation" },
      ],
      structure: "Le programme de licence professionnelle en systèmes embarqués et IoT de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: dakarOnly,
    },
    {
      titre: "Licence Professionnelle en Réseaux Télécommunications",
      slug: "licence-reseaux-telecommunications",
      niveau: "LICENCE",
      dep: RS,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 9,
      accroche: "Déployer et administrer les réseaux d'opérateurs",
      description:
        "Les systèmes de télécommunications apportent aujourd'hui une dimension nouvelle à notre société avec des enjeux technologiques, économiques, culturels et sociologiques. Les réseaux de télécommunications et leurs applications font l'objet de nombreuses initiatives qui nourrissent une forte demande sur le marché de l'emploi en techniciens et ingénieurs.",
      objectifs: [
        "Mise en place et administration des réseaux d'accès (FTTx, RNIS, FR…), des réseaux radio mobiles (2G, 3G, 4G…) et des infrastructures de transmission (fibre optique, FH, VSAT…)",
        "Gestion d'indicateurs de performance réseaux (QoS et QoE)",
        "Interconnexion de réseaux IP et réseaux télécommunications",
        "Conception de réseaux d'objets connectés (IoT)",
      ],
      debouches: ["Technicien télécoms", "Ingénieur déploiement fibre", "Technicien radio mobile"],
      unitesEnseignement: [
        { intitule: "PLA : Programmation et Langage" },
        { intitule: "RSY : Réseaux et Systèmes" },
        { intitule: "EAR : Électronique et Architecture" },
        { intitule: "SIN : Système d'Information" },
        { intitule: "TET : Théorie de l'information et Énergie" },
      ],
      structure: "À la fin du sixième semestre, l'étudiant ayant capitalisé 180 crédits obtient le diplôme de licence professionnelle en Réseaux Télécommunications. " + STRUCT_6,
      fraisScolarite: 1155000,
      fraisInscription: 255000,
      fraisMensualite: 100000,
      campusIds: dakarEtKm,
    },
    {
      titre: "Licence Professionnelle en Banque Finance Assurance",
      slug: "licence-banque-finance-assurance",
      niveau: "LICENCE",
      dep: GM,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      isFeatured: true,
      accroche: "Les métiers de la banque, de la finance et de l'assurance",
      description:
        "Ce programme est conçu pour développer des compétences techniques, commerciales, comportementales et managériales que l'on peut attendre d'un professionnel qui doit exercer dans les entreprises d'assurance, les banques et le milieu financier.",
      debouches: ["Chargé de clientèle", "Conseiller en assurance", "Gestionnaire de portefeuille"],
      structure: "Le programme de licence en Banque Finance Assurance de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Licence Professionnelle en Commerce International",
      slug: "licence-commerce-international",
      niveau: "LICENCE",
      dep: GM,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Des spécialistes de l'import/export directement opérationnels",
      description:
        "La licence professionnelle en commerce international a pour objectif de former à un niveau Bac + 3 des spécialistes de l'import/export, polyglottes, directement opérationnels.",
      debouches: ["Assistant import/export", "Chargé de logistique internationale", "Commercial export"],
      structure: "Le programme de licence en Commerce International de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Licence Professionnelle en Finance & Comptabilité",
      slug: "licence-finance-comptabilite",
      niveau: "LICENCE",
      dep: GM,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Les bases de la comptabilité et de la finance d'entreprise",
      description:
        "La LPFC est un diplôme à finalité professionnelle. Elle permet d'obtenir les bases indispensables pour toute personne se destinant à une carrière dans les domaines de la comptabilité et de la finance.",
      debouches: ["Assistant comptable", "Gestionnaire de paie", "Contrôleur de gestion junior"],
      structure: "Le programme de licence en Finance et Comptabilité de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Licence professionnelle en Marketing et Communication digitale",
      slug: "licence-marketing-communication-digitale",
      niveau: "LICENCE",
      dep: GM,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Communiquer, promouvoir et fédérer une communauté en ligne",
      description:
        "L'objectif de ce programme est de former des étudiants dans l'utilisation des outils numériques pour communiquer, promouvoir, développer et fédérer une communauté de clients potentiels autour d'un produit, d'une marque, d'une entreprise, etc.",
      debouches: ["Community manager", "Chargé de communication digitale", "Traffic manager"],
      unitesEnseignement: [
        { intitule: "Marketing et ses dérivées modernes" },
        { intitule: "Communication" },
        { intitule: "Techniques numériques digital" },
        { intitule: "Outils de développement personnel" },
        { intitule: "Outils de Management" },
        { intitule: "Professionnalisation" },
      ],
      structure: "Le programme de licence en Marketing et Communication digitale de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Licence Professionnelle en Assistanat de direction",
      slug: "licence-assistanat-de-direction",
      niveau: "LICENCE",
      dep: GM,
      duree: "3 ans / 6 semestres",
      semestres: 6,
      credits: 180,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Organiser et coordonner les activités de la direction",
      description:
        "L'objectif général de la licence professionnelle en Assistanat de direction est de former des assistants de direction, capables d'organiser et de coordonner les activités de leurs supérieurs hiérarchiques.",
      debouches: ["Assistant(e) de direction", "Office manager", "Assistant administratif"],
      structure: "Le programme de licence en Assistanat de direction de 6 semestres suit une structure répartie sur six trimestres universitaires. " + STRUCT_6,
      fraisScolarite: 895000,
      fraisInscription: 255000,
      fraisMensualite: 80000,
      campusIds: allCampusIds,
    },
    {
      titre: "Master Professionnel en Réseaux et Systèmes Informatiques",
      slug: "master-reseaux-systemes-informatiques",
      niveau: "MASTER",
      dep: RS,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 8,
      isFeatured: true,
      accroche: "Concevoir les architectures des systèmes d'information d'entreprise",
      description:
        "L'objectif du programme de Master professionnel en Réseaux et Systèmes Informatiques est de former des ingénieurs capables de concevoir les architectures des systèmes d'information d'entreprises. Il propose une approche cohérente des réseaux, des systèmes et des applications réparties de manière à préparer le sortant à la conduite de projets dans le domaine des infrastructures informatiques.",
      objectifs: [
        "Dimensionner, concevoir, déployer, sécuriser et superviser les systèmes informatiques d'entreprises",
        "Mobiliser et intégrer des solutions et technologies adaptées aux réseaux d'entreprises",
        "Garantir la qualité de service et la sécurité des systèmes et réseaux",
      ],
      debouches: ["Ingénieur systèmes et réseaux", "Architecte infrastructure", "Responsable production informatique"],
      unitesEnseignement: [
        { intitule: "CGE : Connaissance Générale" },
        { intitule: "IRS : Ingénierie Réseaux et Systèmes" },
        { intitule: "ICS : Ingénierie de Communication et Services" },
        { intitule: "ISR : Ingénierie de Sécurité Réseaux" },
        { intitule: "ISI : Ingénierie des Systèmes d'Informations" },
      ],
      structure:
        "À la fin du quatrième semestre, l'étudiant ayant capitalisé 120 crédits obtient le diplôme de Master professionnel en Réseaux et Systèmes Informatiques (MP/RSI). " + STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarEtKm,
    },
    {
      titre: "Master Professionnel en Réseaux Télécommunications",
      slug: "master-reseaux-telecommunications",
      niveau: "MASTER",
      dep: RS,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1200,
      nbUE: 7,
      accroche: "Ingénierie des réseaux fixes et mobiles",
      description:
        "L'objectif de ce programme est de fournir aux opérateurs et autres des ingénieurs spécialistes capables de mobiliser et d'intégrer des solutions adéquates et des technologies appropriées et pertinentes pour résoudre des problèmes relevant des domaines des réseaux télécommunications.",
      objectifs: [
        "Acquérir des connaissances fondamentales et actualisées des concepts et méthodologies d'ingénierie réseaux fixes et mobiles",
        "Interpréter les étapes de mise en œuvre de réseaux télécommunications (planification, déploiement et gestion)",
        "Connaître les éléments fondamentaux de l'IA appliquée aux télécommunications",
        "Acquérir des connaissances en programmation et sécurité des réseaux",
      ],
      debouches: ["Ingénieur télécoms", "Ingénieur cœur de réseau", "Ingénieur radio"],
      unitesEnseignement: [
        { intitule: "ISY : Ingénierie des systèmes" },
        { intitule: "ITEL : Ingénierie des Télécommunications" },
        { intitule: "ISI : Ingénierie des Systèmes d'informations" },
        { intitule: "TEL : Télécommunications" },
        { intitule: "IRS : Ingénierie Réseaux et Sécurité" },
        { intitule: "CGE : Connaissance de l'Entreprise" },
        { intitule: "PRO : Professionnalisation" },
      ],
      structure: STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
    {
      titre: "Master Professionnel en Sécurité des Systèmes d'Informations et Monétiques",
      slug: "master-securite-systemes-informations-monetique",
      niveau: "MASTER",
      dep: GI,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1200,
      nbUE: 9,
      accroche: "Sécurité des SI et monétique : deux parcours au choix",
      description:
        "Après une année de formation en tronc commun, au master 1, ce programme offre la possibilité aux futurs cadres d'intégrer en Master 2 l'une des options suivantes : Sécurité des Systèmes d'Information (SSI) ou Monétique et Transactions Sécurisées (MTS).",
      objectifs: [
        "Concevoir et sécuriser les architectures des systèmes d'information d'entreprises (option SSI)",
        "Gérer et sécuriser des infrastructures monétiques (option MTS)",
        "Sécuriser les transactions et les flux interbancaires",
        "Auditer les systèmes d'information et systèmes monétiques",
      ],
      debouches: ["Responsable sécurité des SI", "Expert monétique", "Auditeur SI"],
      structure: STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
    {
      titre: "Master en Virtualisation et Cloud Computing",
      slug: "master-virtualisation-cloud-computing",
      niveau: "MASTER",
      dep: RS,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1200,
      nbUE: 8,
      accroche: "Concevoir, gérer et virtualiser des architectures cloud",
      description:
        "Le Master Virtualisation et Cloud Computing a pour objectif de fournir aux professionnels de l'entreprise les compétences à la fois théoriques et pratiques et les connaissances nécessaires pour concevoir, gérer et virtualiser des architectures complexes de Cloud Computing.",
      objectifs: [
        "Démontrer et appliquer une connaissance avancée des tendances actuelles en administration de réseaux, virtualisation et sécurité du cloud",
        "Concevoir des architectures cloud et des solutions de stockage",
        "Administrer les systèmes virtualisés",
      ],
      debouches: ["Ingénieur solutions cloud", "Ingénieur infrastructures cloud", "Chef de projet cloud", "Administrateur systèmes virtualisés"],
      unitesEnseignement: [
        { intitule: "IRS : Ingénierie Réseaux et Systèmes" },
        { intitule: "IVC : Ingénierie Virtualisation et Cloud Computing" },
        { intitule: "IVI : Ingénierie de la Virtualisation" },
        { intitule: "CGE : Connaissance Générale" },
        { intitule: "ISI : Ingénierie des Systèmes d'Informations" },
        { intitule: "ISR : Ingénierie de Sécurité Réseaux" },
      ],
      structure: STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
    {
      titre: "Master professionnel en MIAGE",
      slug: "master-miage",
      niveau: "MASTER",
      dep: DS,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Méthodes informatiques appliquées à la gestion des entreprises",
      description:
        "Le Master MIAGE forme des experts en systèmes d'information à l'interface de l'informatique, de la gestion et du management. Ce programme pluridisciplinaire permet aux étudiants d'acquérir des compétences techniques et managériales pour concevoir, développer et piloter des solutions numériques adaptées aux besoins des entreprises.",
      debouches: ["Chef de projet SI", "Consultant ERP", "Business analyst"],
      unitesEnseignement: [
        { intitule: "Systèmes d'Information et Modélisation" },
        { intitule: "Réseaux, Cloud et Bases de Données" },
        { intitule: "Développement Web et Programmation" },
        { intitule: "Management et Communication" },
        { intitule: "Mathématiques Appliquées" },
        { intitule: "Développement Avancé en Programmation et Frameworks" },
        { intitule: "ERP et Systèmes d'Information Décisionnels" },
      ],
      structure: "Le programme de master en MIAGE de 4 semestres suit une structure répartie sur quatre trimestres universitaires. " + STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
    {
      titre: "Master Professionnel en Finance",
      slug: "master-finance",
      niveau: "MASTER",
      dep: GM,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Experts du financement des entreprises",
      description:
        "Le Master en finance est une formation professionnelle. Il vise à former des experts du financement des entreprises disposant des outils d'analyse financière et d'une bonne pratique des montages financiers.",
      debouches: ["Analyste financier", "Contrôleur de gestion", "Responsable administratif et financier"],
      structure: "Le programme de master en Finance de 4 semestres suit une structure répartie sur quatre trimestres universitaires. " + STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
    {
      titre: "Master Professionnel en Banque Assurance",
      slug: "master-banque-assurance",
      niveau: "MASTER",
      dep: GM,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Des cadres pour la banque et l'assurance",
      description:
        "Le Master en banque assurance est une formation professionnelle. Il vise à former des cadres de la banque et de l'assurance disposant des outils et d'une bonne pratique en matière de banque et d'assurance.",
      debouches: ["Chargé d'affaires entreprises", "Souscripteur", "Responsable d'agence bancaire"],
      structure: "Le programme de master en Banque Assurance de 4 semestres suit une structure répartie sur quatre trimestres universitaires. " + STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
    {
      titre: "Cycle Ingénieur en Techniques Informatiques",
      slug: "cycle-ingenieur-techniques-informatiques",
      niveau: "INGENIEUR",
      dep: GI,
      duree: "2 ans / 4 semestres",
      semestres: 4,
      credits: 120,
      volumeHoraire: 1800,
      nbUE: 14,
      accroche: "Le programme d'ingénieur historique de l'ISI, lancé en 1999",
      description:
        "Lancé en 1999, le cycle d'ingénieur en techniques informatiques (ITI) forme des ingénieurs polyvalents capables de concevoir, déployer et maintenir des systèmes informatiques complexes, intégré au système LMD et aligné sur les standards internationaux.",
      debouches: ["Ingénieur études et développement", "Ingénieur systèmes d'information", "Chef de projet technique"],
      structure: STRUCT_4,
      fraisScolarite: 1355000,
      fraisInscription: 255000,
      fraisMensualite: 120000,
      campusIds: dakarOnly,
    },
  ];

  const programmeIds: Record<string, string> = {};
  for (const [i, p] of programmes.entries()) {
    const { dep: depSlug, campusIds, unitesEnseignement, ...rest } = p;
    const created = await prisma.programme.create({
      data: {
        ...rest,
        image: IMG.programme,
        session: "2025 - 2026",
        portfolioUrl: PORTFOLIO,
        unitesEnseignement: (unitesEnseignement ?? []) as never,
        objectifs: p.objectifs ?? [],
        debouches: p.debouches ?? [],
        ordre: i,
        departementId: dep[depSlug].id,
        campus: { connect: campusIds ?? allCampusIds },
        diplome: p.niveau === "MASTER" ? "Master professionnel (ANAQ-Sup / CAMES)" : p.niveau === "INGENIEUR" ? "Diplôme d'ingénieur" : "Licence professionnelle (ANAQ-Sup)",
        accreditation: "ANAQ-Sup · CAMES",
        conditionsAdmission:
          p.niveau === "MASTER" || p.niveau === "INGENIEUR"
            ? "Licence (Bac+3) dans le domaine ou diplôme équivalent. Admission sur étude de dossier et entretien avec le chef de département."
            : "Baccalauréat toutes séries ou diplôme admis en équivalence. Admission sur étude de dossier (bulletins et diplômes).",
        erpCode: `PROG-${p.slug.toUpperCase().replace(/-/g, "_")}`,
      },
    });
    programmeIds[p.slug] = created.id;
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const nav = async (
    label: string,
    href: string,
    ordre: number,
    extra: Partial<{ location: "TOP_BAR" | "HEADER" | "FOOTER" | "FOOTER_SECONDARY"; parentId: string; isMega: boolean; description: string }> = {},
  ) =>
    prisma.navigationItem.create({
      data: {
        label,
        href,
        ordre,
        location: extra.location ?? "HEADER",
        parentId: extra.parentId,
        isMega: extra.isMega ?? false,
        description: extra.description,
      },
    });

  // Barre supérieure
  for (const [i, [label, href]] of ([
    ["Nos Formations", "/formations"],
    ["Nos Alumnis", "/alumnis"],
    ["Nos Campus", "/campus"],
    ["FAQ", "/faq"],
  ] as [string, string][]).entries())
    await nav(label, href, i, { location: "TOP_BAR" });

  // Menu principal
  await nav("Accueil", "/", 0);
  const groupe = await nav("Groupe ISI", "/a-propos", 1);
  await nav("À propos", "/a-propos", 0, { parentId: groupe.id });
  await nav("Histoire", "/a-propos/histoire", 1, { parentId: groupe.id });
  await nav("Administration", "/a-propos/administration", 2, { parentId: groupe.id });
  await nav("Localisation", "/a-propos/localisation", 3, { parentId: groupe.id });
  await nav("Mot du Président", "/mot-du-president", 4, { parentId: groupe.id });
  await nav("Formations", "/formations", 2, { isMega: true });
  const vie = await nav("Vie Estudiantine", "/galerie", 3);
  await nav("Frais d'études", "/frais-d-etudes", 0, { parentId: vie.id });
  await nav("Évènements", "/evenements", 1, { parentId: vie.id });
  await nav("Alumnis", "/alumnis", 2, { parentId: vie.id });
  await nav("Témoignages", "/temoignages", 3, { parentId: vie.id });
  await nav("Librairie", "/librairie", 4, { parentId: vie.id });
  await nav("Galerie", "/galerie", 5, { parentId: vie.id });
  await nav("FAQ", "/faq", 6, { parentId: vie.id });
  await nav("Actualités", "/actualites", 4);
  await nav("Contact", "/contact", 5);

  // Pied de page : colonne « Notre institut » puis colonne « Liens utiles »
  const footerLinks: [string, string][] = [
    ["À propos", "/a-propos"],
    ["Réseau Alumni", "/alumnis"],
    ["Librairie", "/librairie"],
    ["Blog", "/actualites"],
    ["Mot du président", "/mot-du-president"],
    ["Galerie", "/galerie"],
  ];
  for (const [i, [label, href]] of footerLinks.entries()) await nav(label, href, i, { location: "FOOTER" });
  const legal: [string, string][] = [
    ["Mentions légales", "/mentions-legales"],
    ["Politique de confidentialité", "/confidentialite"],
    ["Espace admin", "/admin"],
  ];
  for (const [i, [label, href]] of legal.entries()) await nav(label, href, i, { location: "FOOTER_SECONDARY" });

  // -------------------------------------------------------------------------
  // Équipe (direction et chefs de département)
  // -------------------------------------------------------------------------
  const team: {
    prenom: string;
    nom: string;
    poste: string;
    type: PersonneType;
    bio: string;
    photo: string;
    email?: string;
    telephone?: string;
    linkedin?: string;
    dep?: string;
    camp?: string;
    isFeatured?: boolean;
    specialites?: string[];
  }[] = [
    {
      prenom: "Abdou",
      nom: "Sambe",
      poste: "Président du Groupe ISI",
      type: "DIRECTION",
      photo: IMG.president,
      email: "asambe@groupeisi.com",
      bio: "À l'ère du numérique et de la transformation digitale, l'Institut Supérieur d'Informatique (ISI) s'impose comme un acteur clé de la formation supérieure au Sénégal, en Afrique et au-delà. Fort de 31 années d'expertise, l'ISI place l'innovation technologique, la maîtrise des nouvelles TIC et l'adaptabilité au cœur de son projet pédagogique.",
      isFeatured: true,
    },
    {
      prenom: "Thierno Birahime",
      nom: "Sambe",
      poste: "Directeur Général",
      type: "DIRECTION",
      photo: IMG.dg,
      email: "tsambe@groupeisi.com",
      bio: "Directeur Général du Groupe ISI, il pilote le développement des campus et la stratégie académique de l'institut.",
      camp: "isi-dakar",
      isFeatured: true,
    },
    {
      prenom: "M. Ibrahima",
      nom: "Sy",
      poste: "Chef de département IA et Ingénierie de données",
      type: "ENSEIGNANT",
      photo: IMG.ibrahimaSy,
      email: "ibsy@groupeisi.com",
      telephone: "+221 77 313 00 67",
      linkedin: "https://www.linkedin.com/in/ibrahima-sy-35012316a/",
      bio: "Ibrahima Sy est un professeur très expérimenté, reconnu pour son expertise en intelligence artificielle et en science des données. Il allie recherche académique et connaissance pratique du secteur, guidant les étudiants à travers un apprentissage pratique et la résolution innovante de problèmes.",
      dep: DS,
      camp: "isi-dakar",
      isFeatured: true,
      specialites: ["Intelligence artificielle", "Data science", "Machine learning"],
    },
    {
      prenom: "Dr Latyr",
      nom: "Ndiaye",
      poste: "Chef de département Réseaux et Systèmes",
      type: "ENSEIGNANT",
      photo: IMG.latyrNdiaye,
      email: "contact@groupeisi.com",
      linkedin: "https://www.linkedin.com/in/latyr-ndiaye-028b29113/",
      bio: "Docteur et enseignant-chercheur, il dirige le département Réseaux et Systèmes et pilote les académies Cisco et Huawei du Groupe ISI.",
      dep: RS,
      camp: "isi-dakar",
      isFeatured: true,
      specialites: ["Réseaux", "Virtualisation", "Cybersécurité"],
    },
    {
      prenom: "M. El Hadji Mor",
      nom: "Diaw",
      poste: "Chef de département Génie informatique",
      type: "ENSEIGNANT",
      photo: IMG.morDiaw,
      email: "emdiaw@groupeisi.com",
      linkedin: "https://www.linkedin.com/in/el-hadji-mor-diaw-000558315/",
      bio: "Responsable du département Génie informatique, il encadre les parcours en génie logiciel, multimédia, géomatique et systèmes embarqués.",
      dep: GI,
      camp: "isi-dakar",
      isFeatured: true,
      specialites: ["Génie logiciel", "Architecture applicative"],
    },
  ];
  for (const [i, t] of team.entries()) {
    await prisma.personne.create({
      data: {
        prenom: t.prenom,
        nom: t.nom,
        poste: t.poste,
        type: t.type,
        bio: t.bio,
        photo: t.photo,
        email: t.email,
        telephone: t.telephone,
        linkedin: t.linkedin,
        ordre: i,
        isFeatured: t.isFeatured ?? false,
        specialites: t.specialites ?? [],
        slug: `${t.prenom}-${t.nom}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        departementId: t.dep ? dep[t.dep].id : undefined,
        campusId: t.camp ? campus[t.camp].id : undefined,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Alumni
  // -------------------------------------------------------------------------
  const alumni = [
    {
      prenom: "Modou Kara",
      nom: "Samb",
      slug: "modou-kara-samb",
      promotion: 2009,
      programme: "Cycle Ingénieur en Techniques Informatiques",
      poste: "Directeur Général ISI SupTech",
      entreprise: "Groupe ISI",
      ville: "Dakar",
      pays: "Sénégal",
      photo: IMG.alumni1,
      videoUrl: "https://www.youtube.com/watch?v=e2c5qPT5XwA",
      temoignage: "Alumni du Groupe ISI, aujourd'hui Directeur Général d'ISI SupTech et doctorant en sciences et technologies de l'information.",
      isFeatured: true,
    },
    {
      prenom: "Samba",
      nom: "Souare",
      slug: "samba-souare",
      promotion: 2008,
      programme: "Cycle Ingénieur en Techniques Informatiques",
      poste: "Directeur des Systèmes d'Information",
      entreprise: "Groupe ISI",
      ville: "Dakar",
      pays: "Sénégal",
      photo: IMG.alumni2,
      videoUrl: "https://youtu.be/Zx-v17j8BV4",
      temoignage: "Alumni et Directeur des Systèmes d'Information du Groupe ISI, doctorant en sciences et technologies de l'information.",
      isFeatured: true,
    },
    {
      prenom: "Massamba",
      nom: "LO",
      slug: "massamba-lo",
      promotion: 2010,
      programme: "Master en Génie Logiciel",
      poste: "Enseignant",
      entreprise: "Groupe ISI",
      ville: "Dakar",
      pays: "Sénégal",
      photo: IMG.alumni3,
      videoUrl: "https://www.youtube.com/watch?v=YtCgpPi3AHA",
      temoignage: "Alumni devenu professeur au Groupe ISI, il accompagne aujourd'hui les nouvelles promotions.",
      isFeatured: true,
    },
  ];
  for (const a of alumni) await prisma.alumni.create({ data: a });

  // -------------------------------------------------------------------------
  // Partenaires
  // -------------------------------------------------------------------------
  const partenaires: [string, string, PartenaireType][] = [
    ["Cisco", "cisco", "ENTREPRISE"],
    ["Huawei", "huawei", "ENTREPRISE"],
    ["Microsoft", "microsoft", "ENTREPRISE"],
    ["Oracle", "oracle", "ENTREPRISE"],
    ["Orange", "orange", "ENTREPRISE"],
    ["Sonatel", "sonatel", "ENTREPRISE"],
    ["Ecobank", "ecobank", "ENTREPRISE"],
    ["Expresso", "expresso", "ENTREPRISE"],
    ["Free", "free", "ENTREPRISE"],
    ["ANAQ-Sup", "anaq-sup", "INSTITUTIONNEL"],
    ["CAMES", "cames", "INSTITUTIONNEL"],
    ["UCAD", "ucad", "ACADEMIQUE"],
    ["AWS", "aws", "ENTREPRISE"],
    ["Google", "google", "ENTREPRISE"],
    ["IBM", "ibm", "ENTREPRISE"],
    ["BICIS", "bicis", "ENTREPRISE"],
  ];
  for (const [i, [nom, slug, type]] of partenaires.entries())
    await prisma.partenaire.create({ data: { nom, logo: `/partenaires/${slug}.svg`, url: "#", type, ordre: i } });

  // -------------------------------------------------------------------------
  // Témoignages (accueil) et interviews vidéo (page Témoignages)
  // -------------------------------------------------------------------------
  const testimonials: { nom: string; role: string; entreprise?: string; contenu: string; note: number; photo?: string; videoUrl?: string }[] = [
    {
      nom: "Anta Mané",
      role: "Respo. Programmes ANAQ-Sup",
      note: 5,
      contenu:
        "Je suis Anta Mané de nationalité Malienne. Je fais partie de la promotion 2011-2017 en Réseaux Télécom. Je suis reconnaissante envers mon école de formation pour m'avoir fourni les outils et les connaissances nécessaires pour réussir dans ma carrière professionnelle.",
    },
    {
      nom: "Doudou DIEYE",
      role: "Chef Département",
      entreprise: "SARL Energie",
      note: 4.5,
      contenu:
        "Je me nomme Doudou Dièye, chef de département à SARL Energie. Je fais partie de la promotion 2003-2009 en Génie Logiciel. Ma formation m'a inculqué une mentalité d'apprentissage continu et d'adaptabilité aux évolutions rapides du domaine technologique.",
    },
    {
      nom: "Maganga Max Farland",
      role: "CEO",
      entreprise: "ETTIC Gabon",
      note: 4.5,
      contenu:
        "Je suis Maganga Max Farland de nationalité Gabonaise, je fais partie de la promotion 2003-2009 en DITI. J'ai connu ISI après ma formation 1er cycle DTS Télécom. J'ai acquis une capacité à concevoir et à développer des solutions logicielles robustes et innovantes.",
    },
    {
      nom: "Alassane Seck",
      role: "Responsable logiciel",
      entreprise: "Groupe ISI",
      note: 5,
      contenu:
        "Je me nomme Alassane Seck, ingénieur logiciel. J'ai fait la classe spéciale entre 2017 et 2019 avant de me spécialiser en génie logiciel jusqu'à 2022 où j'ai décroché mon master. Depuis 2023 j'occupe le poste de responsable logiciel du groupe. ISI vous forme, ISI vous recrute.",
    },
    {
      nom: "Daouda Diallo",
      role: "Développeur mobile",
      note: 4.5,
      contenu:
        "Le programme d'IAGE d'ISI est axé sur des projets concrets, et non sur la théorie. Les laboratoires, les mentors et les opportunités de recherche m'ont permis d'aller au-delà de mes espérances.",
    },
    {
      nom: "Madièye Johnson",
      role: "Doctorant en sciences et technologies de l'information & en Gestion",
      note: 5,
      contenu: "Interview de Madièye Johnson, doctorant en sciences et technologies de l'information et en gestion, diplômé du Groupe ISI.",
      videoUrl: "https://www.youtube.com/watch?v=d7-cS3bJAtw",
    },
    {
      nom: "Samba Souaré",
      role: "Doctorant en sciences et technologies de l'information",
      note: 5,
      contenu: "Interview de Samba Souaré, alumni du Groupe ISI et Directeur des Systèmes d'Information.",
      videoUrl: "https://youtu.be/Zx-v17j8BV4",
    },
    {
      nom: "Modou Kara Samb",
      role: "Doctorant en sciences et technologies de l'information",
      note: 5,
      contenu: "Interview de Modou Kara Samb, alumni du Groupe ISI et Directeur Général d'ISI SupTech.",
      videoUrl: "https://www.youtube.com/watch?v=e2c5qPT5XwA",
    },
    {
      nom: "Jesus Ekie",
      role: "Doctorant en sciences et technologies de l'information",
      note: 5,
      contenu: "Interview de Jesus Ekie, doctorant en sciences et technologies de l'information, diplômé du Groupe ISI.",
      videoUrl: "https://www.youtube.com/watch?v=0ASUuPHL5vQ",
    },
    {
      nom: "M. Babacar Diop",
      role: "Alumni et Professeur à ISI",
      note: 5,
      contenu: "Interview de M. Babacar Diop, alumni devenu professeur au Groupe ISI.",
      videoUrl: "https://www.youtube.com/watch?v=IYOMFlf4YZg",
    },
    {
      nom: "M. Massamba LO",
      role: "Alumni et Professeur à ISI",
      note: 5,
      contenu: "Interview de M. Massamba LO, alumni devenu professeur au Groupe ISI.",
      videoUrl: "https://www.youtube.com/watch?v=YtCgpPi3AHA",
    },
  ];
  for (const [i, t] of testimonials.entries()) await prisma.testimonial.create({ data: { ...t, ordre: i } });

  // -------------------------------------------------------------------------
  // FAQ (reprise de la page /faq)
  // -------------------------------------------------------------------------
  const faqs: [string, string, string][] = [
    [
      "Vie de campus",
      "À quoi ressemble la vie sur le campus ?",
      "La vie sur le campus offre un environnement dynamique, inclusif et stimulant qui favorise l'excellence académique et l'épanouissement personnel. Les étudiants profitent d'un riche mélange d'apprentissage en classe, d'événements culturels, d'opportunités de leadership, d'activités récréatives et d'engagement communautaire, dans des installations modernes et des espaces verts.",
    ],
    [
      "Vie de campus",
      "Quels sont les clubs et organisations étudiantes proposés ?",
      "Un large éventail d'associations et de clubs étudiants est proposé, incluant des sociétés académiques, des groupes culturels, des équipes sportives et des organisations de bénévoles. Ces activités favorisent le développement du leadership, le travail d'équipe, la créativité et les liens sociaux, enrichissant ainsi l'expérience globale sur le campus.",
    ],
    [
      "Institut",
      "Comment l'institut soutient-il l'apprentissage des étudiants ?",
      "L'institut soutient l'apprentissage des étudiants grâce à des méthodologies d'enseignement modernes, des professeurs expérimentés et dévoués et un accès à des ressources académiques avancées. Des salles de classe interactives, des plateformes d'apprentissage numérique, des bibliothèques et un soutien académique continu garantissent aux étudiants d'acquérir à la fois des connaissances théoriques et des compétences pratiques.",
    ],
    [
      "Institut",
      "Comment les étudiants peuvent-ils accéder aux services de conseil pédagogique ?",
      "Les étudiants ont accès à des conseillers pédagogiques dédiés qui leur offrent un accompagnement personnalisé tout au long de leur parcours universitaire. Ces conseillers les aident dans le choix des cours, la planification de leurs études, l'orientation professionnelle et le suivi de leur progression, afin de garantir qu'ils restent sur la bonne voie pour obtenir leur diplôme et réussir leur avenir.",
    ],
    [
      "Programmes",
      "Quels sont les programmes académiques offerts ?",
      "L'institut propose un large éventail de programmes de licence, de master et de formation professionnelle dans de nombreuses disciplines. Ces programmes sont conçus pour répondre aux normes académiques internationales tout en tenant compte des besoins du secteur, offrant ainsi aux étudiants des parcours flexibles pour atteindre leurs objectifs scolaires et professionnels.",
    ],
    [
      "Programmes",
      "Comment l'institut soutient-il le développement de carrière ?",
      "La Cellule d'Orientation et d'Insertion Professionnelle (COIP) accompagne les étudiants : stages, conseil en orientation, ateliers CV, aide au placement, rencontres avec les recruteurs et partenariats avec les entreprises facilitent la transition vers l'emploi.",
    ],
    [
      "Club & Organisation",
      "Existe-t-il des bourses d'études disponibles pour les étudiants ?",
      "Nos partenaires 3FPT et les Mairies octroient des bourses chaque année à des centaines d'étudiants.",
    ],
    [
      "Club & Organisation",
      "Comment puis-je faire une demande d'admission à l'institut ?",
      "Les candidats doivent soumettre leurs bulletins de notes et leurs diplômes. Certains programmes peuvent exiger un entretien avec le chef de département. Le respect des exigences minimales garantit l'admission.",
    ],
  ];
  for (const [i, [categorie, question, reponse]] of faqs.entries()) await prisma.fAQ.create({ data: { categorie, question, reponse, ordre: i } });

  // -------------------------------------------------------------------------
  // Actualités (contenu réel extrait du site : prisma/data/actualites.json)
  // -------------------------------------------------------------------------
  const catsData: [string, string, string][] = [
    ["Vie de l'institut", "vie-de-l-institut", "#07294D"],
    ["Vie associative", "vie-associative", "#dd9f33"],
    ["Distinctions", "distinctions", "#fdc72f"],
    ["Partenariats", "partenariats", "#0e7490"],
    ["Sport", "sport", "#15803d"],
    ["Clubs et amicale", "clubs-et-amicale", "#809fbf"],
  ];
  const cats: Record<string, string> = {};
  for (const [i, c] of catsData.entries()) {
    const created = await prisma.categorieActualite.create({ data: { nom: c[0], slug: c[1], couleur: c[2], ordre: i } });
    cats[c[1]] = created.id;
  }

  const articles: Article[] = JSON.parse(readFileSync(join(process.cwd(), "prisma/data/actualites.json"), "utf8"));
  /* Visuel de repli par catégorie pour les articles dont les images d'origine ne sont plus en ligne. */
  const REPLI: Record<string, string> = {
    "vie-associative": IMG.gal11,
    "clubs-et-amicale": IMG.vie1,
    distinctions: IMG.histoire2024,
    partenariats: IMG.aproposA,
    sport: IMG.sport1,
    "vie-de-l-institut": IMG.gal2,
  };
  for (const [i, a] of articles.entries()) {
    await prisma.post.create({
      data: {
        titre: a.titre,
        slug: a.slug,
        extrait: a.extrait,
        contenu: a.contenu,
        image: a.image ?? REPLI[a.categorie] ?? IMG.gal1,
        tags: [],
        isPublished: true,
        isFeatured: i < 3,
        publishedAt: new Date(a.publishedAt),
        tempsLecture: a.tempsLecture,
        vues: 0,
        categorieId: cats[a.categorie] ?? cats["vie-de-l-institut"],
        auteurId: admin.id,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Événements
  // -------------------------------------------------------------------------
  await prisma.evenement.create({
    data: {
      titre: "Cérémonie ISI GRADUATION",
      slug: "ceremonie-isi-graduation",
      type: "Cérémonie",
      image: IMG.eventGraduation,
      dateDebut: new Date("2027-01-01T09:00:00Z"),
      dateFin: new Date("2027-01-01T15:40:00Z"),
      heure: "09:00 AM - 03:40 PM",
      lieu: "Grand Théâtre, Dakar",
      campusId: campus["isi-dakar"].id,
      isPublished: true,
      isFeatured: true,
      description:
        "La cérémonie de graduation du Groupe ISI célèbre les nouveaux diplômés de l'institut, en présence de leurs familles, des enseignants et des partenaires de l'école.",
      contenu:
        "<p>Le Sommet sur l'excellence académique et le développement intellectuel réunit des enseignants, des chercheurs, des responsables universitaires et des décideurs politiques afin d'explorer des stratégies pour renforcer la qualité de la recherche et l'épanouissement intellectuel dans l'enseignement supérieur.</p><p>Le sommet mettra l'accent sur l'innovation pédagogique, l'excellence en recherche, l'esprit critique et le développement institutionnel afin de préparer les apprenants à une économie mondiale du savoir en constante évolution.</p>",
    },
  });

  // -------------------------------------------------------------------------
  // Documents (librairie / téléchargements)
  // -------------------------------------------------------------------------
  const docs: { titre: string; fichier: string; type: DocumentType; description: string; taille: string }[] = [
    { titre: `Brochure Groupe ISI 2026-2027`, fichier: "/documents/brochure-groupe-isi-2026-2027.pdf", type: "BROCHURE", description: "Présentation complète du groupe, des départements, des formations et des campus.", taille: "4,2 Mo" },
    { titre: "Fiche de pré-inscription (version papier)", fichier: "/documents/fiche-pre-inscription.pdf", type: "FORMULAIRE", description: "Formulaire à imprimer et à déposer sur l'un de nos campus.", taille: "310 Ko" },
    { titre: "Liste des pièces à fournir", fichier: "/documents/liste-pieces-a-fournir.pdf", type: "FORMULAIRE", description: "Documents nécessaires à la constitution du dossier d'inscription.", taille: "180 Ko" },
    { titre: "Calendrier académique 2026-2027", fichier: "/documents/calendrier-academique-2026-2027.pdf", type: "CALENDRIER", description: "Dates de rentrée, périodes d'examens et vacances.", taille: "250 Ko" },
    { titre: "Règlement intérieur", fichier: "/documents/reglement-interieur.pdf", type: "REGLEMENT", description: "Règles de vie et de discipline applicables sur les campus.", taille: "520 Ko" },
    { titre: "Plaquette Formation Continue & Entreprises", fichier: "/documents/plaquette-formation-continue.pdf", type: "PLAQUETTE", description: "Catalogue des formations courtes, certifications et offres intra-entreprise.", taille: "2,8 Mo" },
  ];
  for (const [i, d] of docs.entries()) await prisma.document.create({ data: { ...d, format: "PDF", ordre: i, telechargements: 0 } });

  // -------------------------------------------------------------------------
  // Configuration ERP (désactivée par défaut, à compléter dans /admin/settings)
  // -------------------------------------------------------------------------
  await prisma.eRPConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      isEnabled: Boolean(process.env.ERP_BASE_URL),
      baseUrl: process.env.ERP_BASE_URL ?? "",
      apiKey: process.env.ERP_API_KEY ?? "",
      apiSecret: process.env.ERP_API_SECRET ?? "",
      webhookSecret: process.env.ERP_WEBHOOK_SECRET ?? "",
      notifyEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? "contact@groupeisi.com",
    },
    update: {},
  });

  // -------------------------------------------------------------------------
  // Pré-inscriptions de démonstration (tableau de bord de l'admin)
  // -------------------------------------------------------------------------
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000);
  const demo = [
    { civilite: "M" as const, prenom: "Souleymane", nom: "Diouf", email: "souleymane.diouf@example.com", telephone: "+221 77 123 45 67", prog: "licence-genie-logiciel", camp: "isi-dakar", statut: "NOUVELLE" as const, erp: "PENDING" as const },
    { civilite: "MLLE" as const, prenom: "Astou", nom: "Ndiaye", email: "astou.ndiaye@example.com", telephone: "+221 78 234 56 78", prog: "master-data-science-intelligence-artificielle", camp: "isi-dakar", statut: "EN_COURS" as const, erp: "SYNCED" as const },
    { civilite: "M" as const, prenom: "Moussa", nom: "Ba", email: "moussa.ba@example.com", telephone: "+221 76 345 67 89", prog: "licence-reseaux-informatiques", camp: "isi-km", statut: "ACCEPTEE" as const, erp: "SYNCED" as const },
    { civilite: "MME" as const, prenom: "Fatoumata", nom: "Kane", email: "fatoumata.kane@example.com", telephone: "+222 22 34 56 78", prog: "licence-banque-finance-assurance", camp: "isi-kl", statut: "NOUVELLE" as const, erp: "FAILED" as const },
  ];
  for (const [i, d] of demo.entries()) {
    const created = await prisma.inscription.create({
      data: {
        numero: `ISI-${new Date().getFullYear()}-${String(i + 1).padStart(5, "0")}`,
        civilite: d.civilite,
        prenom: d.prenom,
        nom: d.nom,
        email: d.email,
        telephone: d.telephone,
        dateNaissance: new Date(2004 - i, 3 + i, 12),
        lieuNaissance: "Dakar",
        nationalite: "Sénégalaise",
        adresse: "Rue 10 x 15, Médina",
        ville: "Dakar",
        pays: "Sénégal",
        niveauEtudes: "BAC",
        serieBac: "S2",
        anneeBac: 2025,
        etablissementOrigine: "Lycée Blaise Diagne",
        programmeId: programmeIds[d.prog],
        campusId: campus[d.camp].id,
        niveauEntree: "1ère année",
        rentree: "Octobre 2026",
        modeFormation: "PRESENTIEL",
        sourceConnaissance: "RESEAUX_SOCIAUX",
        motivation: "Je souhaite devenir un professionnel reconnu du numérique.",
        accepteConditions: true,
        statut: d.statut,
        erpSyncStatus: d.erp,
        erpAttempts: d.erp === "FAILED" ? 3 : d.erp === "SYNCED" ? 1 : 0,
        erpLastError: d.erp === "FAILED" ? "HTTP 503 Service Unavailable" : null,
        erpProspectId: d.erp === "SYNCED" ? `PRS-${1000 + i}` : null,
        erpSyncedAt: d.erp === "SYNCED" ? new Date() : null,
        emailEnvoye: true,
        createdAt: daysAgo(i * 2),
      },
    });
    if (d.erp === "SYNCED") {
      await prisma.eRPMapping.create({
        data: { inscriptionId: created.id, erpEntityType: "prospect", erpEntityId: `PRS-${1000 + i}`, erpUrl: `https://erp.groupeisi.com/prospects/${1000 + i}` },
      });
      await prisma.eRPLog.create({
        data: {
          direction: "OUTBOUND",
          action: "createProspect",
          status: "SUCCESS",
          message: "POST /api/prospects → 201",
          inscriptionId: created.id,
          statusCode: 201,
          durationMs: 340,
          httpMethod: "POST",
          endpoint: "https://erp.groupeisi.com/api/prospects",
        },
      });
    }
    if (d.erp === "FAILED") {
      for (let a = 1; a <= 3; a++)
        await prisma.eRPLog.create({
          data: {
            direction: "OUTBOUND",
            action: "createProspect",
            status: "ERROR",
            message: "HTTP 503 Service Unavailable",
            inscriptionId: created.id,
            attempt: a,
            statusCode: 503,
            durationMs: 1200,
            httpMethod: "POST",
            endpoint: "https://erp.groupeisi.com/api/prospects",
          },
        });
    }
  }

  console.log(`✅ Seed terminé : ${campusData.length} campus, ${programmes.length} formations, ${articles.length} actualités.`);
  console.log(`   Admin : ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
