/**
 * Seed de la base Groupe ISI : contenu du site (départements, programmes,
 * campus, actualités, équipe, alumni, partenaires, FAQ...) + admin + config ERP.
 *   npm run db:seed
 */
import "dotenv/config";
import { PrismaClient, Niveau, PersonneType, PartenaireType, DocumentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const U = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const IMG = {
  hero1: U("photo-1523240795612-9a054b0db644", 1800),
  hero2: U("photo-1531482615713-2afd69097998", 1800),
  hero3: U("photo-1517245386807-bb43f82c33c4", 1800),
  campusDakar: U("photo-1562774053-701939374585"),
  campusKM: U("photo-1541339907198-e08756dedf3f"),
  campusPikine: U("photo-1497633762265-9d179a990aa6"),
  campusPlateau: U("photo-1592280771190-3e2e4d571952"),
  campusKaolack: U("photo-1607237138185-eedd9c632b0b"),
  campusKaffrine: U("photo-1580582932707-520aed937b7b"),
  campusDiourbel: U("photo-1509062522246-3755977927d7"),
  campusNkc: U("photo-1564981797816-1043664bf78d"),
  campusNdb: U("photo-1519452575417-564c1401ecc0"),
  code: U("photo-1461749280684-dccba630e2f6"),
  network: U("photo-1558494949-ef010cbdcc31"),
  mgmt: U("photo-1552664730-d307ca884978"),
  certif: U("photo-1552581234-26160f608093"),
  students1: U("photo-1523580494863-6f3031224c94"),
  students2: U("photo-1529070538774-1843cb3265df"),
  students3: U("photo-1522202176988-66273c2fd55f"),
  students4: U("photo-1524178232363-1fb2b075b655"),
  grad: U("photo-1627556704302-624286467c65"),
  lab: U("photo-1581092160562-40aa08e78837"),
  conf: U("photo-1540575467063-178a50c2df87"),
  jpo: U("photo-1544531586-fde5298cdd40"),
  hack: U("photo-1504384308090-c894fdcc538d"),
  cyber: U("photo-1550751827-4bd374c3f58b"),
  data: U("photo-1551288049-bebda4e38f71"),
  cloud: U("photo-1544197150-b99a580bb7a8"),
  business: U("photo-1454165804606-c3d57bc86b40"),
  bank: U("photo-1450101499163-c8848c66ca85"),
  gallery1: U("photo-1571260899304-425eee4c7efc"),
  gallery2: U("photo-1509062522246-3755977927d7"),
  gallery3: U("photo-1427504494785-3a9ca7044f45"),
  gallery4: U("photo-1503676260728-1c00da094a0b"),
};
const AVATAR = (name: string, bg = "0b2a5b") => `/avatars/${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.svg?bg=${bg}`;

async function main() {
  console.log("🌱 Seed Groupe ISI…");

  // -------------------------------------------------------------------------
  // Nettoyage (ordre respectant les FK)
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
  // Utilisateur admin
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
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      siteName: "Groupe ISI",
      tagline: "Institut Supérieur d'Informatique – Un institut de référence dans les TIC",
      description:
        "Le Groupe ISI (Institut Supérieur d'Informatique) est un établissement privé d'enseignement supérieur fondé en 1994 à Dakar. Plus de 30 ans d'expertise dans la formation initiale et continue en informatique, réseaux, télécommunications et management.",
      logoUrl: "/images/logo-isi.svg",
      logoWhiteUrl: "/images/logo-isi-white.svg",
      email: "contact@groupeisi.com",
      emailAdmissions: "admissions@groupeisi.com",
      phone: "+221 33 825 00 00",
      phone2: "+221 78 739 04 04",
      whatsapp: "+221 78 739 04 04",
      address: "Sacré-Cœur 3, VDN – Dakar, Sénégal",
      horaires: "Lundi – Vendredi : 8h – 18h · Samedi : 9h – 13h",
      facebook: "https://www.facebook.com/GroupeISI/",
      instagram: "https://www.instagram.com/groupeisi/",
      linkedin: "https://sn.linkedin.com/company/groupe-isi",
      youtube: "https://www.youtube.com/@groupeisi",
      twitter: "https://twitter.com/groupeisi",
      tiktok: "https://www.tiktok.com/@groupeisi",
      heroTitle: "Construisez votre avenir dans les technologies de l'information",
      heroSubtitle: "Plus de 30 ans d'excellence en formation informatique, réseaux, télécoms et management. 9 campus au Sénégal et en Mauritanie. Diplômes reconnus par l'État et le CAMES.",
      heroCtaLabel: "Pré-inscription en ligne",
      heroCtaHref: "/pre-inscription",
      annonceBandeau: "Les pré-inscriptions pour la rentrée 2026-2027 sont ouvertes !",
      annonceLien: "/pre-inscription",
      statAnnees: 30,
      statEtudiants: 15000,
      statCampus: 9,
      statProgrammes: 40,
      statInsertion: 87,
      statPartenaires: 120,
      seoTitle: "Groupe ISI – Institut Supérieur d'Informatique | Dakar, Sénégal",
      seoDescription:
        "Groupe ISI : formations BTS, Licence, Master en Génie Logiciel, Réseaux & Télécoms, Cybersécurité, Management. 9 campus au Sénégal et en Mauritanie. Pré-inscription en ligne.",
      seoKeywords: "ISI, Institut Supérieur d'Informatique, Dakar, formation informatique, licence génie logiciel, master réseaux, école informatique Sénégal",
      inscriptionsOuvertes: true,
      anneeAcademique: "2026-2027",
      rentreeOptions: ["Octobre 2026", "Janvier 2027", "Mars 2027"],
    },
  });

  // -------------------------------------------------------------------------
  // Campus
  // -------------------------------------------------------------------------
  const campusData = [
    { nom: "ISI Dakar – Sacré-Cœur (Siège)", slug: "dakar-sacre-coeur", ville: "Dakar", pays: "Sénégal", adresse: "Sacré-Cœur 3, VDN – Dakar", telephone: "+221 33 825 00 00", email: "contact@groupeisi.com", image: IMG.campusDakar, images: [IMG.gallery1, IMG.lab, IMG.students1], isSiege: true, latitude: 14.7167, longitude: -17.4677, description: "Le campus historique et siège du Groupe ISI, au cœur de Dakar. Il accueille l'ensemble des filières informatiques et management, du BTS au Master, ainsi que le pôle formation continue et certifications.", equipements: ["Laboratoires réseaux Cisco", "Salles informatiques climatisées", "Bibliothèque numérique", "Amphithéâtre 300 places", "Incubateur ISI Lab", "Wi-Fi haut débit"] },
    { nom: "ISI Dakar – Plateau", slug: "dakar-plateau", ville: "Dakar", pays: "Sénégal", adresse: "Avenue Lamine Guèye – Dakar Plateau", telephone: "+221 33 825 00 01", email: "plateau@groupeisi.com", image: IMG.campusPlateau, images: [IMG.students2], description: "Situé au centre des affaires de Dakar, le campus du Plateau est dédié aux filières management, banque-finance et aux cours du soir pour les professionnels.", equipements: ["Salles de cours modulables", "Espace coworking", "Salle de conférence", "Wi-Fi haut débit"] },
    { nom: "ISI Keur Massar", slug: "keur-massar", ville: "Keur Massar", pays: "Sénégal", adresse: "Arrêt Tigo, en face Station Shell – Keur Massar", telephone: "+221 78 739 04 04", email: "keurmassar@groupeisi.com", image: IMG.campusKM, images: [IMG.gallery3, IMG.students3], latitude: 14.7833, longitude: -17.3167, description: "Premier institut d'informatique de la banlieue dakaroise, ISI Keur Massar accompagne la politique de désengorgement des universités publiques avec des filières en gestion de l'information, réseaux-télécoms, banque-finance-assurance et comptabilité.", equipements: ["Laboratoire réseaux", "3 salles informatiques", "Bibliothèque", "Terrain de sport", "Cantine"] },
    { nom: "ISI Pikine", slug: "pikine", ville: "Pikine", pays: "Sénégal", adresse: "Route des Niayes, Pikine – Dakar", telephone: "+221 33 825 00 02", email: "pikine@groupeisi.com", image: IMG.campusPikine, images: [IMG.gallery4], description: "Le campus de Pikine offre aux jeunes de la banlieue un accès de proximité à des formations professionnalisantes en informatique, maintenance et gestion.", equipements: ["Salles informatiques", "Atelier maintenance", "Wi-Fi"] },
    { nom: "ISI Kaolack", slug: "kaolack", ville: "Kaolack", pays: "Sénégal", adresse: "Quartier Léona, Kaolack", telephone: "+221 33 941 00 00", email: "kaolack@groupeisi.com", image: IMG.campusKaolack, description: "Au cœur du bassin arachidier, ISI Kaolack forme les talents numériques et managériaux du centre du Sénégal.", equipements: ["Salles informatiques", "Laboratoire réseaux", "Bibliothèque"] },
    { nom: "ISI Kaffrine", slug: "kaffrine", ville: "Kaffrine", pays: "Sénégal", adresse: "Avenue Cheikh Ahmadou Bamba, Kaffrine", telephone: "+221 33 946 00 00", email: "kaffrine@groupeisi.com", image: IMG.campusKaffrine, description: "ISI Kaffrine propose des formations BTS et Licence adaptées aux besoins économiques de la région.", equipements: ["Salles informatiques", "Wi-Fi"] },
    { nom: "ISI Diourbel", slug: "diourbel", ville: "Diourbel", pays: "Sénégal", adresse: "Route de Touba, Diourbel", telephone: "+221 33 971 00 00", email: "diourbel@groupeisi.com", image: IMG.campusDiourbel, description: "Le campus de Diourbel dessert la région du Baol avec des filières informatiques et gestion.", equipements: ["Salles informatiques", "Bibliothèque"] },
    { nom: "ISI Nouakchott", slug: "nouakchott", ville: "Nouakchott", pays: "Mauritanie", adresse: "Tevragh Zeina, Nouakchott", telephone: "+222 45 25 00 00", email: "nouakchott@groupeisi.com", image: IMG.campusNkc, description: "Première implantation du Groupe ISI dans la sous-région, le campus de Nouakchott propose les filières phares du groupe aux étudiants mauritaniens.", equipements: ["Laboratoire réseaux", "Salles informatiques", "Bibliothèque"] },
    { nom: "ISI Nouadhibou", slug: "nouadhibou", ville: "Nouadhibou", pays: "Mauritanie", adresse: "Centre-ville, Nouadhibou", telephone: "+222 45 74 00 00", email: "nouadhibou@groupeisi.com", image: IMG.campusNdb, description: "Le campus de Nouadhibou accompagne le développement économique de la capitale économique mauritanienne.", equipements: ["Salles informatiques", "Wi-Fi"] },
  ];
  const campus: Record<string, { id: string }> = {};
  for (const [i, c] of campusData.entries()) {
    campus[c.slug] = await prisma.campus.create({ data: { ...c, ordre: i, erpCode: `CAMP-${c.slug.toUpperCase().replace(/-/g, "_")}` } });
  }
  const allCampusIds = Object.values(campus).map((c) => ({ id: c.id }));
  const dakarIds = ["dakar-sacre-coeur", "dakar-plateau", "keur-massar", "pikine"].map((s) => ({ id: campus[s].id }));
  const mainIds = ["dakar-sacre-coeur", "keur-massar", "kaolack", "nouakchott"].map((s) => ({ id: campus[s].id }));

  // -------------------------------------------------------------------------
  // Départements
  // -------------------------------------------------------------------------
  const depData = [
    {
      nom: "Génie Informatique", slug: "genie-informatique", icone: "Code2", couleur: "#0b2a5b", image: IMG.code,
      accroche: "Concevoir les systèmes d'information et les applications de demain",
      description: "Le département Génie Informatique forme des professionnels capables de concevoir des systèmes d'information, de développer des logiciels et applications informatiques (web, mobile, desktop), et de maîtriser le multimédia et la géomatique.",
      contenu: "<p>Le département Génie Informatique est le cœur historique du Groupe ISI. Il propose des parcours complets du BTS au Master en génie logiciel, développement d'applications, multimédia, data science et intelligence artificielle.</p><p>Nos étudiants bénéficient d'un enseignement orienté projet, de laboratoires équipés des dernières technologies et d'un accompagnement vers les certifications professionnelles (Oracle, Microsoft, Scrum).</p><h3>Points forts</h3><ul><li>Pédagogie par projets et hackathons</li><li>Stages obligatoires en entreprise dès la 2ème année</li><li>Incubateur ISI Lab pour les projets étudiants</li><li>Partenariats avec les leaders du numérique</li></ul>",
    },
    {
      nom: "Réseaux et Systèmes", slug: "reseaux-et-systemes", icone: "Network", couleur: "#0e7490", image: IMG.network,
      accroche: "Concevoir, sécuriser et administrer les infrastructures numériques",
      description: "Le département Réseaux et Systèmes forme des professionnels capables de concevoir, sécuriser et administrer des réseaux de données LAN, WAN et WLAN, avec une expertise en virtualisation, cloud computing et cybersécurité.",
      contenu: "<p>Les diplômés du département Réseaux et Systèmes sont des experts de l'infrastructure numérique : administration systèmes et réseaux, télécommunications, cybersécurité, cloud et DevOps.</p><p>Le département est <strong>Académie Cisco</strong> et centre de préparation aux certifications CCNA, CompTIA, Huawei et Microsoft.</p><h3>Points forts</h3><ul><li>Laboratoires réseaux Cisco et Huawei</li><li>Préparation aux certifications internationales</li><li>Modules cloud AWS / Azure</li><li>Simulations d'attaques et SOC pédagogique</li></ul>",
    },
    {
      nom: "Management et Administration", slug: "management-et-administration", icone: "Briefcase", couleur: "#b45309", image: IMG.mgmt,
      accroche: "Piloter la performance, optimiser les ressources, manager les équipes",
      description: "Le département Management et Administration forme des professionnels capables de piloter la performance, d'optimiser les ressources et de manager des équipes dans les secteurs de la banque, de la finance, du commerce et de la gestion de projets.",
      contenu: "<p>Le département Management et Administration propose des filières en Banque-Finance-Assurance, Commerce International, Gestion de Projets, Comptabilité-Gestion Financière et Assistanat de Direction.</p><p>Les formations combinent enseignement académique, outils numériques de gestion (ERP, BI) et immersion en entreprise.</p><h3>Points forts</h3><ul><li>Intervenants professionnels du secteur bancaire et des entreprises</li><li>Maîtrise des outils numériques de gestion</li><li>Réseau d'entreprises partenaires pour les stages</li></ul>",
    },
    {
      nom: "Formation Continue et Certifications", slug: "formation-continue", icone: "GraduationCap", couleur: "#15803d", image: IMG.certif,
      accroche: "Se perfectionner tout au long de la vie professionnelle",
      description: "Le pôle Formation Continue accompagne les professionnels et les entreprises : cours du soir, formations courtes, certifications internationales (Cisco, Microsoft, Oracle, PMP) et formations sur mesure.",
      contenu: "<p>Le pôle Formation Continue du Groupe ISI propose des parcours flexibles adaptés aux professionnels en activité : cours du soir, week-end, formations intensives et à distance.</p><h3>Offres</h3><ul><li>Certifications Cisco CCNA / CCNP</li><li>Certifications Microsoft, Oracle, AWS</li><li>Gestion de projets (PMP, Scrum, PRINCE2)</li><li>Formations intra-entreprise sur mesure</li></ul>",
    },
  ];
  const dep: Record<string, { id: string }> = {};
  for (const [i, d] of depData.entries()) dep[d.slug] = await prisma.departement.create({ data: { ...d, ordre: i } });

  // -------------------------------------------------------------------------
  // Programmes
  // -------------------------------------------------------------------------
  type P = { titre: string; slug: string; niveau: Niveau; duree: string; dep: string; accroche: string; description: string; objectifs: string[]; debouches: string[]; competences?: string[]; fraisInscription?: number; fraisScolarite?: number; diplome?: string; accreditation?: string; image?: string; isFeatured?: boolean; campusIds?: { id: string }[]; modules?: unknown; conditionsAdmission?: string };
  const programmes: P[] = [
    // --- Licences Génie Informatique
    { titre: "Licence Génie Logiciel", slug: "licence-genie-logiciel", niveau: "LICENCE", duree: "3 ans", dep: "genie-informatique", isFeatured: true, image: IMG.code, accroche: "Concevoir et développer des applications web, mobiles et d'entreprise", description: "La Licence Génie Logiciel forme des développeurs et analystes-programmeurs maîtrisant l'ensemble du cycle de vie du logiciel : analyse, conception, développement, tests et déploiement.", objectifs: ["Maîtriser les langages et frameworks modernes (Java, Python, JavaScript, PHP)", "Concevoir des bases de données et des architectures logicielles", "Développer des applications web et mobiles", "Appliquer les méthodes agiles et le DevOps"], debouches: ["Développeur full-stack", "Analyste-programmeur", "Développeur mobile", "Testeur QA", "Consultant SI junior"], competences: ["Java / Spring", "JavaScript / React / Node", "Python", "SQL / NoSQL", "Git, CI/CD", "UML, Merise"], fraisInscription: 50000, fraisScolarite: 850000, diplome: "Licence professionnelle", accreditation: "ANAQ-Sup", campusIds: allCampusIds, modules: [{ semestre: "S1", intitule: "Algorithmique et programmation", ects: 6 }, { semestre: "S1", intitule: "Architecture des ordinateurs", ects: 4 }, { semestre: "S2", intitule: "Bases de données", ects: 6 }, { semestre: "S3", intitule: "Programmation orientée objet (Java)", ects: 6 }, { semestre: "S4", intitule: "Développement web (JS, React)", ects: 6 }, { semestre: "S5", intitule: "Génie logiciel & méthodes agiles", ects: 6 }, { semestre: "S6", intitule: "Projet de fin d'études & stage", ects: 12 }] },
    { titre: "Licence Réseaux Informatiques", slug: "licence-reseaux-informatiques", niveau: "LICENCE", duree: "3 ans", dep: "reseaux-et-systemes", isFeatured: true, image: IMG.network, accroche: "Administrer et sécuriser les infrastructures réseaux", description: "La Licence Réseaux Informatiques forme des administrateurs systèmes et réseaux capables de concevoir, déployer, sécuriser et maintenir des infrastructures LAN/WAN et des services cloud.", objectifs: ["Concevoir et administrer des réseaux LAN, WAN, WLAN", "Administrer les systèmes Windows Server et Linux", "Mettre en œuvre la virtualisation et le cloud", "Préparer la certification Cisco CCNA"], debouches: ["Administrateur réseaux", "Administrateur systèmes", "Technicien support infrastructure", "Ingénieur cloud junior"], competences: ["Cisco CCNA", "Linux / Windows Server", "VMware / Proxmox", "AWS / Azure", "Sécurité réseau"], fraisInscription: 50000, fraisScolarite: 850000, diplome: "Licence professionnelle", accreditation: "ANAQ-Sup", campusIds: allCampusIds },
    { titre: "Licence Réseaux et Télécommunications", slug: "licence-reseaux-telecommunications", niveau: "LICENCE", duree: "3 ans", dep: "reseaux-et-systemes", accroche: "Les réseaux d'opérateurs, la fibre et la 4G/5G", description: "Formation aux technologies des réseaux d'opérateurs : transmission, fibre optique, réseaux mobiles 4G/5G, VoIP et supervision.", objectifs: ["Maîtriser les technologies de transmission et de commutation", "Déployer et maintenir des réseaux mobiles", "Superviser les infrastructures télécoms"], debouches: ["Technicien télécoms", "Ingénieur radio junior", "Responsable supervision NOC"], fraisInscription: 50000, fraisScolarite: 850000, diplome: "Licence professionnelle", accreditation: "ANAQ-Sup", campusIds: mainIds },
    { titre: "Licence Cybersécurité", slug: "licence-cybersecurite", niveau: "LICENCE", duree: "3 ans", dep: "reseaux-et-systemes", isFeatured: true, image: IMG.cyber, accroche: "Protéger les systèmes d'information contre les menaces", description: "La Licence Cybersécurité forme des professionnels capables d'analyser les risques, sécuriser les systèmes et réseaux, et répondre aux incidents de sécurité.", objectifs: ["Analyser les vulnérabilités et les menaces", "Mettre en place des politiques de sécurité", "Réaliser des tests d'intrusion", "Gérer les incidents et la forensique"], debouches: ["Analyste SOC", "Pentester junior", "Administrateur sécurité", "Consultant cybersécurité"], competences: ["Sécurité réseau", "Cryptographie", "Ethical hacking", "ISO 27001", "SIEM"], fraisInscription: 50000, fraisScolarite: 950000, diplome: "Licence professionnelle", accreditation: "ANAQ-Sup", campusIds: dakarIds },
    { titre: "Licence Maintenance Informatique", slug: "licence-maintenance-informatique", niveau: "LICENCE", duree: "3 ans", dep: "reseaux-et-systemes", accroche: "Diagnostiquer, réparer, maintenir les parcs informatiques", description: "Formation aux métiers du support et de la maintenance des équipements informatiques, des postes de travail aux serveurs.", objectifs: ["Diagnostiquer et réparer les pannes matérielles et logicielles", "Gérer un parc informatique", "Assurer le support utilisateurs"], debouches: ["Technicien de maintenance", "Technicien support niveau 1/2", "Gestionnaire de parc"], fraisInscription: 50000, fraisScolarite: 750000, diplome: "Licence professionnelle", campusIds: allCampusIds },
    { titre: "Licence Multimédia et Communication Digitale", slug: "licence-multimedia", niveau: "LICENCE", duree: "3 ans", dep: "genie-informatique", accroche: "Créer des contenus numériques et des expériences interactives", description: "La Licence Multimédia forme des créatifs numériques : design graphique, motion design, UX/UI, production audiovisuelle et communication digitale.", objectifs: ["Maîtriser les outils de création graphique et vidéo", "Concevoir des interfaces UX/UI", "Piloter une stratégie de communication digitale"], debouches: ["Designer UX/UI", "Motion designer", "Community manager", "Chef de projet digital"], fraisInscription: 50000, fraisScolarite: 800000, diplome: "Licence professionnelle", campusIds: dakarIds },
    { titre: "Licence Informatique Industrielle", slug: "licence-informatique-industrielle", niveau: "LICENCE", duree: "3 ans", dep: "genie-informatique", accroche: "Automatisation, IoT et systèmes embarqués", description: "Formation aux systèmes embarqués, à l'automatisme industriel, à l'Internet des objets et à la robotique.", objectifs: ["Programmer des microcontrôleurs et systèmes embarqués", "Concevoir des solutions IoT", "Automatiser des processus industriels"], debouches: ["Technicien automatisme", "Développeur embarqué", "Intégrateur IoT"], fraisInscription: 50000, fraisScolarite: 850000, diplome: "Licence professionnelle", campusIds: [{ id: campus["dakar-sacre-coeur"].id }] },
    // --- Licences Management
    { titre: "Licence Banque, Finance, Assurance", slug: "licence-banque-finance-assurance", niveau: "LICENCE", duree: "3 ans", dep: "management-et-administration", isFeatured: true, image: IMG.bank, accroche: "Les métiers de la banque et de l'assurance", description: "La Licence BFA forme des professionnels opérationnels pour les établissements bancaires, les compagnies d'assurance et les institutions de microfinance.", objectifs: ["Maîtriser les opérations bancaires et les produits d'assurance", "Analyser les risques financiers", "Conseiller et fidéliser la clientèle"], debouches: ["Chargé de clientèle", "Gestionnaire de sinistres", "Analyste crédit", "Conseiller en microfinance"], fraisInscription: 50000, fraisScolarite: 750000, diplome: "Licence professionnelle", accreditation: "ANAQ-Sup", campusIds: allCampusIds },
    { titre: "Licence Commerce International", slug: "licence-commerce-international", niveau: "LICENCE", duree: "3 ans", dep: "management-et-administration", accroche: "Développer les échanges à l'international", description: "Formation aux techniques du commerce international : import-export, logistique, transit, douane et négociation interculturelle.", objectifs: ["Maîtriser les opérations d'import-export", "Gérer la logistique et le transit", "Négocier avec des partenaires internationaux"], debouches: ["Assistant import-export", "Déclarant en douane", "Commercial export", "Responsable logistique"], fraisInscription: 50000, fraisScolarite: 750000, diplome: "Licence professionnelle", campusIds: dakarIds },
    { titre: "Licence Gestion de Projets", slug: "licence-gestion-de-projets", niveau: "LICENCE", duree: "3 ans", dep: "management-et-administration", accroche: "Planifier, piloter et livrer des projets", description: "Formation aux méthodes et outils de la gestion de projets : planification, budgétisation, suivi-évaluation, méthodes agiles.", objectifs: ["Concevoir et planifier un projet", "Piloter les ressources et les délais", "Utiliser les outils de suivi-évaluation"], debouches: ["Assistant chef de projet", "Chargé de suivi-évaluation", "Coordinateur de projets ONG"], fraisInscription: 50000, fraisScolarite: 750000, diplome: "Licence professionnelle", campusIds: mainIds },
    { titre: "Licence Comptabilité et Gestion Financière", slug: "licence-comptabilite-gestion-financiere", niveau: "LICENCE", duree: "3 ans", dep: "management-et-administration", accroche: "Tenir et analyser les comptes de l'entreprise", description: "Formation aux métiers de la comptabilité, de la fiscalité, du contrôle de gestion et de l'audit selon le référentiel SYSCOHADA.", objectifs: ["Tenir la comptabilité générale et analytique", "Établir les états financiers SYSCOHADA", "Maîtriser la fiscalité des entreprises"], debouches: ["Comptable", "Assistant contrôleur de gestion", "Assistant auditeur", "Gestionnaire de paie"], fraisInscription: 50000, fraisScolarite: 750000, diplome: "Licence professionnelle", accreditation: "ANAQ-Sup", campusIds: allCampusIds },
    { titre: "Licence Assistanat de Direction", slug: "licence-assistanat-de-direction", niveau: "LICENCE", duree: "3 ans", dep: "management-et-administration", accroche: "Le bras droit des dirigeants", description: "Formation aux fonctions d'assistanat de direction : organisation, communication professionnelle, bureautique avancée, gestion administrative.", objectifs: ["Organiser l'agenda et les déplacements de la direction", "Rédiger et gérer les documents professionnels", "Maîtriser la bureautique et les outils collaboratifs"], debouches: ["Assistant(e) de direction", "Office manager", "Assistant(e) RH"], fraisInscription: 50000, fraisScolarite: 700000, diplome: "Licence professionnelle", campusIds: allCampusIds },
    // --- Masters
    { titre: "Master Génie Logiciel", slug: "master-genie-logiciel", niveau: "MASTER", duree: "2 ans", dep: "genie-informatique", isFeatured: true, image: IMG.students1, accroche: "Architecte et chef de projet logiciel", description: "Le Master Génie Logiciel forme des ingénieurs logiciels et architectes capables de concevoir des systèmes complexes, de piloter des équipes de développement et d'innover.", objectifs: ["Concevoir des architectures logicielles distribuées et microservices", "Piloter des projets agiles à grande échelle", "Maîtriser le cloud native et le DevOps", "Mener un projet de recherche appliquée"], debouches: ["Ingénieur logiciel", "Architecte logiciel", "Lead developer", "Chef de projet IT", "Product owner"], competences: ["Architecture microservices", "Cloud & Kubernetes", "Sécurité applicative", "Big Data", "Management de projet"], fraisInscription: 75000, fraisScolarite: 1250000, diplome: "Master professionnel", accreditation: "CAMES / ANAQ-Sup", campusIds: mainIds, conditionsAdmission: "Licence en informatique ou diplôme équivalent (Bac+3). Admission sur dossier et entretien." },
    { titre: "Master Réseaux et Systèmes Informatiques", slug: "master-reseaux-systemes-informatiques", niveau: "MASTER", duree: "2 ans", dep: "reseaux-et-systemes", isFeatured: true, image: IMG.cloud, accroche: "Expert en infrastructures cloud et réseaux d'entreprise", description: "Le Master RSI forme des experts en conception et gestion d'infrastructures réseaux et systèmes complexes, cloud computing et virtualisation.", objectifs: ["Concevoir des architectures réseaux d'entreprise sécurisées", "Déployer des infrastructures cloud hybrides", "Automatiser l'administration (Infrastructure as Code)", "Piloter la gouvernance des SI"], debouches: ["Ingénieur réseaux", "Architecte infrastructure", "Ingénieur cloud / DevOps", "Responsable SI"], fraisInscription: 75000, fraisScolarite: 1250000, diplome: "Master professionnel", accreditation: "CAMES / ANAQ-Sup", campusIds: mainIds },
    { titre: "Master Réseaux de Télécommunications", slug: "master-reseaux-telecommunications", niveau: "MASTER", duree: "2 ans", dep: "reseaux-et-systemes", accroche: "Ingénierie des réseaux d'opérateurs et 5G", description: "Formation d'ingénieurs télécoms maîtrisant les réseaux mobiles de nouvelle génération, la fibre optique, la VoIP et la planification radio.", objectifs: ["Planifier et optimiser des réseaux mobiles 4G/5G", "Concevoir des réseaux de transport optiques", "Gérer la qualité de service des réseaux"], debouches: ["Ingénieur télécoms", "Ingénieur radio", "Ingénieur transmission", "Chef de projet déploiement"], fraisInscription: 75000, fraisScolarite: 1250000, diplome: "Master professionnel", accreditation: "ANAQ-Sup", campusIds: [{ id: campus["dakar-sacre-coeur"].id }, { id: campus["nouakchott"].id }] },
    { titre: "Master Sécurité des Systèmes Informatiques et Monétique", slug: "master-securite-systemes-monetique", niveau: "MASTER", duree: "2 ans", dep: "reseaux-et-systemes", isFeatured: true, image: IMG.cyber, accroche: "Cybersécurité et sécurité des paiements électroniques", description: "Ce Master forme des experts en sécurité des systèmes d'information et en monétique : sécurisation des transactions, conformité PCI-DSS, audit et gouvernance de la sécurité.", objectifs: ["Auditer et sécuriser les systèmes d'information", "Maîtriser la sécurité des paiements et de la monétique", "Gérer les incidents et la continuité d'activité", "Assurer la conformité réglementaire"], debouches: ["RSSI", "Consultant cybersécurité", "Expert monétique", "Auditeur sécurité", "Analyste SOC senior"], fraisInscription: 75000, fraisScolarite: 1350000, diplome: "Master professionnel", accreditation: "ANAQ-Sup", campusIds: dakarIds },
    { titre: "Master Informatique Appliquée à la Gestion des Entreprises", slug: "master-informatique-appliquee-gestion", niveau: "MASTER", duree: "2 ans", dep: "genie-informatique", accroche: "Systèmes d'information et pilotage de l'entreprise", description: "Master reconnu par le CAMES formant des experts du système d'information d'entreprise : ERP, business intelligence, urbanisation et gouvernance des SI.", objectifs: ["Concevoir et déployer des ERP", "Piloter la transformation digitale", "Mettre en place des solutions de Business Intelligence"], debouches: ["Consultant ERP", "Chef de projet SI", "Data analyst", "DSI adjoint"], fraisInscription: 75000, fraisScolarite: 1250000, diplome: "Master professionnel", accreditation: "CAMES", campusIds: mainIds },
    { titre: "Master Big Data et Intelligence Artificielle", slug: "master-big-data-intelligence-artificielle", niveau: "MASTER", duree: "2 ans", dep: "genie-informatique", isFeatured: true, image: IMG.data, accroche: "Données massives, machine learning et IA", description: "Le Master Big Data & IA forme des data scientists et ingénieurs IA capables de collecter, traiter, analyser et valoriser les données massives avec les techniques d'apprentissage automatique.", objectifs: ["Concevoir des pipelines Big Data (Hadoop, Spark)", "Développer des modèles de machine learning et deep learning", "Déployer des solutions IA en production (MLOps)", "Garantir l'éthique et la gouvernance des données"], debouches: ["Data scientist", "Data engineer", "Ingénieur IA / ML", "Consultant data"], competences: ["Python, R", "Spark, Hadoop", "TensorFlow, PyTorch", "SQL / NoSQL", "MLOps"], fraisInscription: 75000, fraisScolarite: 1450000, diplome: "Master professionnel", accreditation: "ANAQ-Sup", campusIds: [{ id: campus["dakar-sacre-coeur"].id }] },
    { titre: "Master Management des Systèmes d'Information", slug: "master-management-systemes-information", niveau: "MASTER", duree: "2 ans", dep: "management-et-administration", accroche: "Gouvernance, stratégie et transformation digitale", description: "Formation de managers hybrides à la croisée du management et des technologies : gouvernance des SI, gestion de projets numériques, conduite du changement.", objectifs: ["Aligner le SI sur la stratégie de l'entreprise", "Piloter des programmes de transformation digitale", "Gérer les budgets et la performance du SI"], debouches: ["Chef de projet digital", "Consultant en organisation", "Responsable transformation digitale"], fraisInscription: 75000, fraisScolarite: 1150000, diplome: "Master professionnel", campusIds: dakarIds },
    { titre: "Master Banque, Finance et Assurance", slug: "master-banque-finance-assurance", niveau: "MASTER", duree: "2 ans", dep: "management-et-administration", accroche: "Les cadres de la finance de demain", description: "Master formant des cadres pour la banque, l'assurance, la microfinance et les marchés financiers : ingénierie financière, gestion des risques, conformité.", objectifs: ["Maîtriser l'analyse financière et la gestion des risques", "Concevoir des produits bancaires et d'assurance", "Appliquer les normes prudentielles et la conformité"], debouches: ["Chargé d'affaires entreprises", "Analyste risques", "Responsable conformité", "Gestionnaire de portefeuille"], fraisInscription: 75000, fraisScolarite: 1150000, diplome: "Master professionnel", accreditation: "ANAQ-Sup", campusIds: mainIds },
    // --- BTS
    { titre: "BTS Informatique de Gestion", slug: "bts-informatique-de-gestion", niveau: "BTS", duree: "2 ans", dep: "genie-informatique", accroche: "Développement et gestion des données de l'entreprise", description: "Le BTS Informatique de Gestion (diplôme d'État) forme des techniciens supérieurs en développement d'applications de gestion et administration de bases de données.", objectifs: ["Développer des applications de gestion", "Administrer des bases de données", "Assurer le support informatique"], debouches: ["Développeur d'applications", "Technicien informatique", "Gestionnaire de bases de données"], fraisInscription: 40000, fraisScolarite: 550000, diplome: "BTS – Diplôme d'État", campusIds: allCampusIds },
    { titre: "BTS Réseaux Informatiques et Télécommunications", slug: "bts-reseaux-telecommunications", niveau: "BTS", duree: "2 ans", dep: "reseaux-et-systemes", accroche: "Installer et maintenir les réseaux", description: "Le BTS RIT (diplôme d'État) forme des techniciens supérieurs pour l'installation, la configuration et la maintenance des réseaux informatiques et télécoms.", objectifs: ["Installer et configurer des réseaux locaux", "Maintenir les équipements télécoms", "Assurer la sécurité de base des réseaux"], debouches: ["Technicien réseaux", "Technicien télécoms", "Technicien support"], fraisInscription: 40000, fraisScolarite: 550000, diplome: "BTS – Diplôme d'État", campusIds: allCampusIds },
    { titre: "BTS Comptabilité et Gestion", slug: "bts-comptabilite-gestion", niveau: "BTS", duree: "2 ans", dep: "management-et-administration", accroche: "Les fondamentaux de la comptabilité d'entreprise", description: "Le BTS Comptabilité et Gestion (diplôme d'État) forme des techniciens supérieurs capables de tenir la comptabilité et de participer à la gestion financière d'une organisation.", objectifs: ["Tenir la comptabilité courante", "Établir les déclarations fiscales et sociales", "Utiliser les logiciels comptables"], debouches: ["Aide-comptable", "Assistant de gestion", "Gestionnaire de paie"], fraisInscription: 40000, fraisScolarite: 500000, diplome: "BTS – Diplôme d'État", campusIds: allCampusIds },
    { titre: "BTS Assistanat de Direction", slug: "bts-assistanat-de-direction", niveau: "BTS", duree: "2 ans", dep: "management-et-administration", accroche: "Organisation et communication professionnelle", description: "Le BTS Assistanat de Direction (diplôme d'État) forme des assistant(e)s polyvalent(e)s maîtrisant la bureautique, la communication et l'organisation administrative.", objectifs: ["Gérer l'administration courante", "Maîtriser la bureautique", "Assurer la communication interne et externe"], debouches: ["Assistant(e) de direction", "Secrétaire administratif", "Assistant(e) commercial(e)"], fraisInscription: 40000, fraisScolarite: 500000, diplome: "BTS – Diplôme d'État", campusIds: allCampusIds },
    // --- Certifications / Formation continue
    { titre: "Certification Cisco CCNA", slug: "certification-cisco-ccna", niveau: "CERTIFICAT", duree: "6 mois", dep: "formation-continue", accroche: "La certification réseau de référence", description: "Préparation intensive à la certification Cisco CCNA 200-301 au sein de l'Académie Cisco du Groupe ISI, en cours du soir ou week-end.", objectifs: ["Maîtriser les fondamentaux réseaux, IP, routage et commutation", "Configurer des équipements Cisco", "Réussir l'examen CCNA 200-301"], debouches: ["Administrateur réseaux certifié", "Technicien réseaux Cisco"], fraisInscription: 25000, fraisScolarite: 350000, diplome: "Certification Cisco", campusIds: mainIds },
    { titre: "Certification Développeur Web Full-Stack", slug: "certification-developpeur-web", niveau: "CERTIFICAT", duree: "9 mois", dep: "formation-continue", accroche: "Devenir développeur web en 9 mois", description: "Bootcamp intensif de reconversion au développement web : HTML/CSS, JavaScript, React, Node.js, bases de données et déploiement.", objectifs: ["Créer des sites et applications web complètes", "Maîtriser React et Node.js", "Déployer sur le cloud"], debouches: ["Développeur web junior", "Intégrateur web", "Freelance"], fraisInscription: 25000, fraisScolarite: 450000, diplome: "Certificat ISI", campusIds: dakarIds },
    { titre: "Certification Microsoft Azure Fundamentals", slug: "certification-microsoft-azure", niveau: "CERTIFICAT", duree: "3 mois", dep: "formation-continue", accroche: "Les fondamentaux du cloud Microsoft", description: "Préparation à la certification Microsoft AZ-900 : concepts cloud, services Azure, sécurité, tarification et gouvernance.", objectifs: ["Comprendre les concepts du cloud computing", "Découvrir les services Azure", "Réussir l'examen AZ-900"], debouches: ["Administrateur cloud junior", "Technicien support cloud"], fraisInscription: 25000, fraisScolarite: 250000, diplome: "Certification Microsoft", campusIds: dakarIds },
    { titre: "Formation Gestion de Projets Agile / Scrum", slug: "formation-gestion-projets-agile-scrum", niveau: "FORMATION_CONTINUE", duree: "5 jours", dep: "formation-continue", accroche: "Piloter des projets en mode agile", description: "Formation courte pour cadres et chefs de projet : cadre Scrum, rôles, cérémonies, outils (Jira) et préparation à la certification PSM I.", objectifs: ["Comprendre les valeurs et principes agiles", "Mettre en œuvre Scrum dans son équipe", "Préparer la certification PSM I"], debouches: ["Scrum master", "Product owner", "Chef de projet agile"], fraisInscription: 0, fraisScolarite: 300000, diplome: "Attestation ISI", campusIds: dakarIds },
  ];
  const programmeIds: Record<string, string> = {};
  for (const [i, p] of programmes.entries()) {
    const { dep: depSlug, campusIds, modules, ...rest } = p;
    const created = await prisma.programme.create({
      data: {
        ...rest,
        modules: modules as never,
        ordre: i,
        departementId: dep[depSlug].id,
        campus: { connect: campusIds ?? allCampusIds },
        erpCode: `PROG-${p.slug.toUpperCase().replace(/-/g, "_")}`,
        conditionsAdmission: p.conditionsAdmission ?? (p.niveau === "MASTER" ? "Licence (Bac+3) dans le domaine ou équivalent. Admission sur dossier et entretien." : p.niveau === "LICENCE" ? "Baccalauréat toutes séries (S, L, G, T). Admission sur dossier. Passerelles possibles avec un BTS/DUT." : p.niveau === "BTS" ? "Baccalauréat ou niveau Terminale. Admission sur dossier." : "Ouvert aux étudiants et professionnels. Aucun prérequis de diplôme."),
      },
    });
    programmeIds[p.slug] = created.id;
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const nav = async (label: string, href: string, ordre: number, extra: Partial<{ location: "HEADER" | "FOOTER" | "FOOTER_SECONDARY"; parentId: string; isMega: boolean; description: string; isExternal: boolean }> = {}) =>
    prisma.navigationItem.create({ data: { label, href, ordre, location: extra.location ?? "HEADER", parentId: extra.parentId, isMega: extra.isMega ?? false, description: extra.description, isExternal: extra.isExternal ?? false } });

  await nav("Accueil", "/", 0);
  const ecole = await nav("L'École", "/presentation", 1);
  await nav("Présentation du Groupe", "/presentation", 0, { parentId: ecole.id, description: "Histoire, mission, valeurs" });
  await nav("Départements", "/departements", 1, { parentId: ecole.id, description: "Nos 4 pôles de formation" });
  await nav("Nos campus", "/campus", 2, { parentId: ecole.id, description: "9 campus au Sénégal et en Mauritanie" });
  await nav("Équipe pédagogique", "/equipe", 3, { parentId: ecole.id, description: "Direction et enseignants" });
  await nav("Alumni", "/alumni", 4, { parentId: ecole.id, description: "Le réseau des anciens" });
  await nav("Galerie", "/galerie", 5, { parentId: ecole.id, description: "La vie sur nos campus" });
  const formations = await nav("Formations", "/programmes", 2, { isMega: true });
  await nav("Toutes les formations", "/programmes", 0, { parentId: formations.id });
  await nav("BTS (Bac+2)", "/programmes?niveau=BTS", 1, { parentId: formations.id, description: "Diplômes d'État en 2 ans" });
  await nav("Licences (Bac+3)", "/programmes?niveau=LICENCE", 2, { parentId: formations.id, description: "Licences professionnelles" });
  await nav("Masters (Bac+5)", "/programmes?niveau=MASTER", 3, { parentId: formations.id, description: "Masters professionnels" });
  await nav("Certifications", "/programmes?niveau=CERTIFICAT", 4, { parentId: formations.id, description: "Cisco, Microsoft, Oracle…" });
  await nav("Formation continue", "/departements/formation-continue", 5, { parentId: formations.id, description: "Cours du soir & entreprises" });
  const admissions = await nav("Admissions", "/admissions", 3);
  await nav("Conditions d'admission", "/admissions", 0, { parentId: admissions.id });
  await nav("Pré-inscription en ligne", "/pre-inscription", 1, { parentId: admissions.id });
  await nav("Frais de scolarité", "/admissions#frais", 2, { parentId: admissions.id });
  await nav("FAQ", "/faq", 3, { parentId: admissions.id });
  await nav("Téléchargements", "/telechargements", 4, { parentId: admissions.id });
  const actus = await nav("Actualités", "/actualites", 4);
  await nav("Actualités", "/actualites", 0, { parentId: actus.id });
  await nav("Événements", "/evenements", 1, { parentId: actus.id });
  await nav("Contact", "/contact", 5);

  const footerLinks: [string, string][] = [["Présentation", "/presentation"], ["Départements", "/departements"], ["Formations", "/programmes"], ["Campus", "/campus"], ["Admissions", "/admissions"], ["Actualités", "/actualites"], ["Événements", "/evenements"], ["Alumni", "/alumni"], ["FAQ", "/faq"], ["Contact", "/contact"]];
  for (const [i, [label, href]] of footerLinks.entries()) await nav(label, href, i, { location: "FOOTER" });
  const legal: [string, string][] = [["Mentions légales", "/mentions-legales"], ["Politique de confidentialité", "/confidentialite"], ["Espace admin", "/admin"]];
  for (const [i, [label, href]] of legal.entries()) await nav(label, href, i, { location: "FOOTER_SECONDARY" });

  // -------------------------------------------------------------------------
  // Catégories & actualités
  // -------------------------------------------------------------------------
  const cats: Record<string, string> = {};
  for (const [i, c] of [["Vie de l'école", "vie-de-l-ecole", "#0b2a5b"], ["Admissions", "admissions", "#f26522"], ["Événements", "evenements", "#0e7490"], ["Partenariats", "partenariats", "#15803d"], ["Réussites", "reussites", "#b45309"]].entries()) {
    const created = await prisma.categorieActualite.create({ data: { nom: c[0], slug: c[1], couleur: c[2], ordre: i } });
    cats[c[1]] = created.id;
  }
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000);
  const posts = [
    { titre: "Ouverture des pré-inscriptions pour l'année académique 2026-2027", slug: "ouverture-pre-inscriptions-2026-2027", cat: "admissions", image: IMG.students1, isFeatured: true, publishedAt: daysAgo(3), tags: ["admissions", "rentrée"], extrait: "Le Groupe ISI ouvre ses pré-inscriptions en ligne pour la rentrée d'octobre 2026. Bénéficiez d'une réduction de 10 % sur les frais d'inscription avant le 31 juillet.", contenu: "<p>Le Groupe ISI est heureux d'annoncer l'ouverture des pré-inscriptions pour l'année académique 2026-2027 dans l'ensemble de ses 9 campus au Sénégal et en Mauritanie.</p><h2>Comment s'inscrire ?</h2><p>La pré-inscription se fait entièrement en ligne en quelques minutes via notre formulaire. Un conseiller vous recontacte sous 48 heures pour finaliser votre dossier.</p><h2>Offre de lancement</h2><p>Tous les candidats ayant finalisé leur pré-inscription avant le <strong>31 juillet 2026</strong> bénéficient d'une <strong>réduction de 10 %</strong> sur les frais d'inscription.</p><h2>Pièces à fournir</h2><ul><li>Copie légalisée du diplôme du Baccalauréat (ou du dernier diplôme)</li><li>Relevés de notes</li><li>Copie de la pièce d'identité</li><li>2 photos d'identité</li></ul><p>Rendez-vous sur la page <a href=\"/pre-inscription\">Pré-inscription</a> pour démarrer votre candidature.</p>" },
    { titre: "Cérémonie de remise des diplômes : 1 200 nouveaux diplômés célébrés au Grand Théâtre", slug: "ceremonie-remise-diplomes-2026", cat: "vie-de-l-ecole", image: IMG.grad, isFeatured: true, publishedAt: daysAgo(12), tags: ["diplômés", "cérémonie"], extrait: "Le Groupe ISI a célébré sa 30ème promotion au Grand Théâtre National de Dakar en présence des autorités, des partenaires et des familles.", contenu: "<p>Moment fort de l'année, la cérémonie de remise des diplômes du Groupe ISI a réuni plus de 3 000 personnes au Grand Théâtre National Doudou Ndiaye Coumba Rose.</p><p>1 200 diplômés de BTS, Licence et Master ont reçu leur parchemin des mains de la direction du groupe et des représentants du Ministère de l'Enseignement supérieur.</p><blockquote>« Vous êtes désormais les ambassadeurs de l'excellence ISI. Le marché de l'emploi vous attend, et nous savons que vous y brillerez. »</blockquote><p>Les majors de promotion ont été récompensés par des ordinateurs portables offerts par nos partenaires.</p>" },
    { titre: "ISI signe un partenariat avec Huawei pour la formation aux technologies 5G et cloud", slug: "partenariat-huawei-5g-cloud", cat: "partenariats", image: IMG.network, publishedAt: daysAgo(20), tags: ["partenariat", "huawei", "5G"], extrait: "Le Groupe ISI devient Huawei ICT Academy : les étudiants en réseaux et télécoms auront accès aux certifications HCIA et à des laboratoires 5G de dernière génération.", contenu: "<p>Le Groupe ISI et Huawei Sénégal ont signé une convention de partenariat faisant du groupe une <strong>Huawei ICT Academy</strong>.</p><p>Ce partenariat permettra aux étudiants des départements Réseaux et Systèmes de préparer les certifications HCIA (Routing & Switching, Cloud, 5G, Security) et d'accéder à des équipements de laboratoire de dernière génération.</p><p>Les meilleurs étudiants pourront également participer à la compétition internationale Huawei ICT Competition.</p>" },
    { titre: "Hackathon ISI Innov'Africa : 48 heures pour coder l'avenir", slug: "hackathon-isi-innov-africa", cat: "evenements", image: IMG.hack, publishedAt: daysAgo(35), tags: ["hackathon", "innovation"], extrait: "150 étudiants de tous les campus se sont affrontés lors du hackathon annuel du Groupe ISI autour du thème « Le numérique au service de l'agriculture ».", contenu: "<p>Pendant 48 heures, 30 équipes ont conçu des solutions numériques innovantes pour l'agriculture sénégalaise : applications de suivi des cultures, marketplaces, capteurs IoT d'irrigation…</p><p>L'équipe <strong>AgriSmart</strong> du campus de Kaolack a remporté le premier prix avec une solution de prédiction des rendements par intelligence artificielle. Elle sera incubée à ISI Lab.</p>" },
    { titre: "Nos étudiants en Master Cybersécurité remportent le CTF national", slug: "master-cybersecurite-ctf-national", cat: "reussites", image: IMG.cyber, publishedAt: daysAgo(48), tags: ["cybersécurité", "compétition"], extrait: "L'équipe ISI Sec a terminé première du Capture The Flag national organisé par l'Agence de l'Informatique de l'État, devant 25 équipes universitaires.", contenu: "<p>Belle performance pour l'équipe ISI Sec, composée de cinq étudiants du Master Sécurité des Systèmes Informatiques et Monétique, qui a remporté le CTF national de cybersécurité.</p><p>Les épreuves portaient sur la cryptographie, l'exploitation web, la forensique et le reverse engineering. Cette victoire qualifie l'équipe pour la finale africaine à Nairobi.</p>" },
    { titre: "Journée Portes Ouvertes : venez découvrir nos campus le 15 octobre", slug: "journee-portes-ouvertes-octobre", cat: "evenements", image: IMG.jpo, publishedAt: daysAgo(60), tags: ["JPO", "campus"], extrait: "Tous les campus du Groupe ISI ouvrent leurs portes aux futurs étudiants et à leurs familles : visites, rencontres avec les enseignants, ateliers et animations.", contenu: "<p>Le samedi 15 octobre, de 9h à 17h, le Groupe ISI organise sa grande Journée Portes Ouvertes simultanément dans ses 9 campus.</p><h2>Au programme</h2><ul><li>Visite des laboratoires et salles de cours</li><li>Présentation des filières par les responsables pédagogiques</li><li>Ateliers découverte : robotique, cybersécurité, design</li><li>Témoignages d'alumni</li><li>Inscription sur place avec frais de dossier offerts</li></ul>" },
    { titre: "Le Groupe ISI obtient le renouvellement de l'accréditation ANAQ-Sup pour 8 filières", slug: "accreditation-anaq-sup-renouvellement", cat: "vie-de-l-ecole", image: IMG.conf, publishedAt: daysAgo(75), tags: ["accréditation", "qualité"], extrait: "L'Autorité Nationale d'Assurance Qualité de l'Enseignement supérieur a renouvelé l'accréditation de 8 programmes de Licence et Master du Groupe ISI.", contenu: "<p>À l'issue d'une évaluation externe rigoureuse, l'ANAQ-Sup a renouvelé pour cinq ans l'accréditation des Licences Génie Logiciel, Réseaux Informatiques, Cybersécurité, Banque-Finance-Assurance, Comptabilité, ainsi que des Masters Génie Logiciel, RSI et Sécurité-Monétique.</p><p>Cette reconnaissance confirme la qualité de nos programmes et la valeur des diplômes délivrés aux étudiants.</p>" },
    { titre: "Forum Entreprises 2026 : plus de 60 recruteurs à la rencontre de nos étudiants", slug: "forum-entreprises-2026", cat: "vie-de-l-ecole", image: IMG.business, publishedAt: daysAgo(90), tags: ["emploi", "forum"], extrait: "Sonatel, Ecobank, Free, Atos, Wave, Expresso… plus de 60 entreprises ont participé au Forum Entreprises du Groupe ISI pour proposer stages et emplois.", contenu: "<p>Le Forum Entreprises annuel du Groupe ISI a réuni plus de 60 entreprises partenaires et 2 000 étudiants sur le campus de Sacré-Cœur.</p><p>Plus de 400 entretiens de recrutement ont été réalisés sur place pour des stages, des alternances et des premiers emplois. Ce forum illustre notre engagement : un taux d'insertion professionnelle de 87 % dans les 6 mois suivant le diplôme.</p>" },
  ];
  for (const p of posts) {
    const { cat, ...rest } = p;
    await prisma.post.create({ data: { ...rest, categorieId: cats[cat], auteurId: admin.id, isPublished: true, tempsLecture: 3, vues: Math.floor(Math.random() * 1500) + 100 } });
  }

  // -------------------------------------------------------------------------
  // Événements
  // -------------------------------------------------------------------------
  const inDays = (n: number, h = 9) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, 0, 0, 0); return d; };
  const events = [
    { titre: "Journée Portes Ouvertes – Tous campus", slug: "journee-portes-ouvertes-2026", type: "Portes ouvertes", image: IMG.jpo, dateDebut: inDays(21), dateFin: inDays(21, 17), heure: "9h – 17h", lieu: "Tous les campus ISI", campus: "dakar-sacre-coeur", isFeatured: true, description: "Visitez nos campus, rencontrez les enseignants et découvrez nos filières. Frais de dossier offerts pour toute inscription sur place.", contenu: "<p>Programme de la journée : visites guidées, ateliers découverte (robotique, cybersécurité, design UX), témoignages d'alumni, conseils d'orientation personnalisés.</p>", lienInscription: "/pre-inscription" },
    { titre: "Conférence : L'intelligence artificielle au service de l'Afrique", slug: "conference-ia-afrique", type: "Conférence", image: IMG.data, dateDebut: inDays(35, 15), heure: "15h – 18h", lieu: "Amphithéâtre ISI Sacré-Cœur", campus: "dakar-sacre-coeur", isFeatured: true, description: "Conférence-débat avec des experts de Google, Orange et de l'écosystème startup sénégalais sur les opportunités de l'IA pour le continent.", contenu: "<p>Intervenants : chercheurs, entrepreneurs et responsables innovation partageront leurs visions et cas d'usage concrets. Session de questions-réponses et networking.</p>" },
    { titre: "Atelier Cisco : Introduction aux réseaux (CCNA)", slug: "atelier-cisco-ccna-introduction", type: "Atelier", image: IMG.network, dateDebut: inDays(14, 10), heure: "10h – 13h", lieu: "Laboratoire réseaux – ISI Keur Massar", campus: "keur-massar", description: "Atelier pratique gratuit ouvert aux lycéens et étudiants : configurez votre premier réseau sur équipements Cisco.", contenu: "<p>Places limitées à 30 participants. Inscription obligatoire.</p>", lienInscription: "/contact" },
    { titre: "Forum Entreprises & Stages 2026", slug: "forum-entreprises-stages-2026", type: "Forum", image: IMG.business, dateDebut: inDays(60), dateFin: inDays(61, 17), heure: "9h – 17h", lieu: "Campus ISI Sacré-Cœur", campus: "dakar-sacre-coeur", description: "Deux jours de rencontres avec plus de 60 entreprises partenaires : stages, alternances, premiers emplois.", contenu: "<p>Préparez votre CV et venez rencontrer les recruteurs de Sonatel, Ecobank, Wave, Atos, Free et bien d'autres.</p>" },
    { titre: "Cérémonie de remise des diplômes – Promotion 2026", slug: "remise-diplomes-promotion-2026", type: "Cérémonie", image: IMG.grad, dateDebut: inDays(95, 16), heure: "16h", lieu: "Grand Théâtre National, Dakar", campus: "dakar-sacre-coeur", description: "Célébration officielle des diplômés BTS, Licence et Master de la promotion 2026.", contenu: "<p>Sur invitation. Les diplômés recevront leurs invitations par email.</p>" },
    { titre: "Hackathon ISI Innov'Africa 2025", slug: "hackathon-innov-africa-2025", type: "Hackathon", image: IMG.hack, dateDebut: inDays(-40), dateFin: inDays(-38), heure: "48h non-stop", lieu: "ISI Lab – Sacré-Cœur", campus: "dakar-sacre-coeur", description: "48 heures pour concevoir des solutions numériques au service de l'agriculture.", contenu: "<p>Événement terminé. Retrouvez les résultats dans nos actualités.</p>" },
  ];
  for (const e of events) {
    const { campus: cslug, ...rest } = e;
    await prisma.evenement.create({ data: { ...rest, campusId: campus[cslug].id } });
  }

  // -------------------------------------------------------------------------
  // Équipe
  // -------------------------------------------------------------------------
  const team: { prenom: string; nom: string; poste: string; type: PersonneType; dep?: string; camp?: string; bio: string; specialites?: string[]; diplomes?: string[]; isFeatured?: boolean }[] = [
    { prenom: "Amadou", nom: "Diallo", poste: "Président-Directeur Général", type: "DIRECTION", bio: "Fondateur du Groupe ISI en 1994, ingénieur en informatique diplômé de l'ENSIMAG, il a fait du groupe l'une des premières écoles privées d'informatique d'Afrique de l'Ouest.", diplomes: ["Ingénieur ENSIMAG", "MBA HEC Paris"], isFeatured: true },
    { prenom: "Fatou", nom: "Ndiaye", poste: "Directrice Générale Adjointe – Académique", type: "DIRECTION", bio: "Docteure en informatique, elle pilote la politique pédagogique, l'assurance qualité et les relations avec l'ANAQ-Sup et le CAMES.", diplomes: ["Doctorat en Informatique, UCAD", "Master Sorbonne Université"], isFeatured: true },
    { prenom: "Moussa", nom: "Sarr", poste: "Directeur des Études", type: "DIRECTION", dep: "genie-informatique", bio: "Responsable de l'organisation des enseignements et du suivi des étudiants sur l'ensemble des campus.", diplomes: ["Master Génie Logiciel", "Certifié PMP"], isFeatured: true },
    { prenom: "Aïssatou", nom: "Ba", poste: "Directrice des Admissions et de la Communication", type: "ADMINISTRATION", bio: "Elle accompagne les candidats et leurs familles dans leur orientation et coordonne la communication du groupe.", isFeatured: true },
    { prenom: "Ibrahima", nom: "Fall", poste: "Chef du département Génie Informatique", type: "ENSEIGNANT", dep: "genie-informatique", bio: "Architecte logiciel avec 15 ans d'expérience en entreprise, il enseigne le génie logiciel et l'architecture des systèmes.", specialites: ["Architecture logicielle", "Java / Spring", "Cloud native"], diplomes: ["Ingénieur ESP Dakar", "Certifié AWS Solutions Architect"] },
    { prenom: "Mariama", nom: "Sow", poste: "Chef du département Réseaux et Systèmes", type: "ENSEIGNANT", dep: "reseaux-et-systemes", bio: "Instructrice Cisco certifiée CCNP, elle dirige l'Académie Cisco du groupe et les laboratoires réseaux.", specialites: ["Réseaux Cisco", "Cybersécurité", "Cloud"], diplomes: ["Master Réseaux & Télécoms", "CCNP, CEH"] },
    { prenom: "Cheikh", nom: "Gueye", poste: "Chef du département Management", type: "ENSEIGNANT", dep: "management-et-administration", bio: "Ancien cadre bancaire, il enseigne la finance d'entreprise et la gestion des risques.", specialites: ["Finance", "Banque", "Gestion des risques"], diplomes: ["Master Finance, CESAG", "Expert-comptable"] },
    { prenom: "Khady", nom: "Diop", poste: "Enseignante – Data Science & IA", type: "ENSEIGNANT", dep: "genie-informatique", bio: "Data scientist, elle coordonne le Master Big Data & IA et anime les projets de recherche appliquée.", specialites: ["Machine learning", "Python", "Big Data"], diplomes: ["Doctorat en IA, Université Paris-Saclay"] },
    { prenom: "Ousmane", nom: "Kane", poste: "Responsable Formation Continue & Certifications", type: "ADMINISTRATION", dep: "formation-continue", bio: "Il conçoit l'offre de formation continue pour les entreprises et pilote les partenariats de certification.", specialites: ["Ingénierie de formation", "Certifications IT"] },
    { prenom: "Ndèye", nom: "Thiam", poste: "Directrice du campus ISI Keur Massar", type: "DIRECTION", camp: "keur-massar", bio: "Elle dirige le campus de Keur Massar depuis son ouverture et développe les liens avec le tissu économique de la banlieue.", diplomes: ["Master Management des SI"] },
    { prenom: "Abdoulaye", nom: "Mbaye", poste: "Enseignant – Cybersécurité", type: "ENSEIGNANT", dep: "reseaux-et-systemes", bio: "Consultant en sécurité offensive et coach de l'équipe ISI Sec, championne du CTF national.", specialites: ["Pentest", "Forensique", "SOC"], diplomes: ["OSCP", "CISSP"] },
    { prenom: "Rokhaya", nom: "Cissé", poste: "Responsable Relations Entreprises & Stages", type: "ADMINISTRATION", bio: "Elle accompagne les étudiants dans leur recherche de stage et anime le réseau des entreprises partenaires.", specialites: ["Insertion professionnelle", "Partenariats"] },
  ];
  for (const [i, t] of team.entries()) {
    await prisma.personne.create({
      data: {
        prenom: t.prenom, nom: t.nom, poste: t.poste, type: t.type, bio: t.bio, ordre: i, isFeatured: t.isFeatured ?? false,
        slug: `${t.prenom}-${t.nom}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-"),
        photo: AVATAR(`${t.prenom} ${t.nom}`, i % 2 ? "f26522" : "0b2a5b"),
        email: `${t.prenom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${t.nom.toLowerCase()}@groupeisi.com`,
        linkedin: "https://www.linkedin.com/",
        specialites: t.specialites ?? [], diplomes: t.diplomes ?? [],
        departementId: t.dep ? dep[t.dep].id : undefined,
        campusId: campus[t.camp ?? "dakar-sacre-coeur"].id,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Alumni
  // -------------------------------------------------------------------------
  const alumni = [
    { prenom: "Mamadou", nom: "Seck", promotion: 2018, programme: "Master Génie Logiciel", poste: "Lead Developer", entreprise: "Wave Mobile Money", ville: "Dakar", pays: "Sénégal", isFeatured: true, temoignage: "ISI m'a donné les bases solides et l'esprit projet qui m'ont permis d'intégrer une fintech en pleine croissance dès la sortie de l'école.", parcours: "Après sa Licence et son Master à ISI, Mamadou a rejoint Wave comme développeur backend avant de devenir Lead Developer d'une équipe de 8 personnes." },
    { prenom: "Awa", nom: "Diagne", promotion: 2019, programme: "Master Réseaux et Systèmes Informatiques", poste: "Ingénieure Cloud", entreprise: "Sonatel / Orange", ville: "Dakar", pays: "Sénégal", isFeatured: true, temoignage: "Les laboratoires Cisco et la préparation aux certifications ont fait toute la différence lors de mes entretiens.", parcours: "Certifiée CCNP et AWS, Awa pilote aujourd'hui la migration cloud des services de l'opérateur." },
    { prenom: "Boubacar", nom: "Camara", promotion: 2016, programme: "Licence Banque, Finance, Assurance", poste: "Chargé d'affaires Entreprises", entreprise: "Ecobank", ville: "Dakar", pays: "Sénégal", isFeatured: true, temoignage: "La formation BFA d'ISI est très concrète : dès le premier jour en agence, j'étais opérationnel.", parcours: "Entré comme stagiaire à Ecobank, Boubacar a gravi les échelons jusqu'au poste de chargé d'affaires entreprises." },
    { prenom: "Mariam", nom: "Sy", promotion: 2020, programme: "Master Sécurité des Systèmes Informatiques et Monétique", poste: "Analyste SOC", entreprise: "Atos", ville: "Paris", pays: "France", isFeatured: true, temoignage: "Le Master Sécurité m'a ouvert les portes de l'international. Je travaille aujourd'hui dans un SOC de niveau mondial.", parcours: "Après un stage de fin d'études chez un intégrateur dakarois, Mariam a été recrutée par Atos en France." },
    { prenom: "Ibrahima", nom: "Ndour", promotion: 2021, programme: "Licence Génie Logiciel", poste: "Fondateur & CEO", entreprise: "Jokko Tech", ville: "Kaolack", pays: "Sénégal", isFeatured: true, temoignage: "Le hackathon ISI a été le point de départ de ma startup. L'incubateur ISI Lab nous a accompagnés pendant un an.", parcours: "Ibrahima a créé Jokko Tech, une plateforme de gestion pour les coopératives agricoles, aujourd'hui utilisée par 200 coopératives." },
    { prenom: "Aminata", nom: "Ly", promotion: 2017, programme: "Master Informatique Appliquée à la Gestion des Entreprises", poste: "Consultante ERP SAP", entreprise: "Deloitte", ville: "Abidjan", pays: "Côte d'Ivoire", temoignage: "Un Master reconnu par le CAMES, c'est un vrai passeport pour travailler dans toute la sous-région.", parcours: "Aminata accompagne les grandes entreprises ouest-africaines dans leurs déploiements SAP." },
    { prenom: "Ahmed", nom: "Ould Mohamed", promotion: 2022, programme: "Licence Réseaux Informatiques", poste: "Administrateur Réseaux", entreprise: "Mauritel", ville: "Nouakchott", pays: "Mauritanie", temoignage: "Étudier à ISI Nouakchott m'a permis d'obtenir un diplôme reconnu sans quitter mon pays.", parcours: "Diplômé du campus de Nouakchott, Ahmed a rejoint l'opérateur historique mauritanien." },
    { prenom: "Coumba", nom: "Faye", promotion: 2023, programme: "Master Big Data et Intelligence Artificielle", poste: "Data Scientist", entreprise: "Baamtu", ville: "Dakar", pays: "Sénégal", temoignage: "Les projets réels menés avec les entreprises partenaires pendant le Master ont fait la différence.", parcours: "Coumba développe des modèles prédictifs pour le secteur bancaire." },
  ];
  for (const a of alumni) {
    await prisma.alumni.create({ data: { ...a, slug: `${a.prenom}-${a.nom}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-"), photo: AVATAR(`${a.prenom} ${a.nom}`, "0e7490"), linkedin: "https://www.linkedin.com/" } });
  }

  // -------------------------------------------------------------------------
  // Partenaires
  // -------------------------------------------------------------------------
  const partenaires: [string, string, PartenaireType][] = [["Cisco", "cisco", "ENTREPRISE"], ["Microsoft", "microsoft", "ENTREPRISE"], ["Oracle", "oracle", "ENTREPRISE"], ["Huawei", "huawei", "ENTREPRISE"], ["Orange", "orange", "ENTREPRISE"], ["Sonatel", "sonatel", "ENTREPRISE"], ["Free", "free", "ENTREPRISE"], ["Ecobank", "ecobank", "ENTREPRISE"], ["ANAQ-Sup", "anaq-sup", "INSTITUTIONNEL"], ["CAMES", "cames", "INSTITUTIONNEL"], ["UCAD", "ucad", "ACADEMIQUE"], ["IBM", "ibm", "ENTREPRISE"], ["Google", "google", "ENTREPRISE"], ["AWS", "aws", "ENTREPRISE"], ["Expresso", "expresso", "ENTREPRISE"], ["BICIS", "bicis", "ENTREPRISE"]];
  for (const [i, [nom, slug, type]] of partenaires.entries()) await prisma.partenaire.create({ data: { nom, logo: `/partenaires/${slug}.svg`, url: "#", type, ordre: i } });

  // -------------------------------------------------------------------------
  // Témoignages
  // -------------------------------------------------------------------------
  const testimonials = [
    { nom: "Adja Fatou Mbengue", role: "Étudiante en Licence 3 Génie Logiciel", contenu: "À ISI, on apprend en faisant. Dès la première année, nous avons développé de vraies applications pour des entreprises. Les enseignants sont disponibles et passionnés." },
    { nom: "Pape Malick Diouf", role: "Étudiant en Master 2 Réseaux et Systèmes", contenu: "Les laboratoires Cisco et Huawei sont exceptionnels. J'ai passé ma certification CCNA en deuxième année grâce à l'Académie Cisco de l'école." },
    { nom: "Sophie Mendy", role: "Diplômée Licence BFA, chargée de clientèle", contenu: "La formation Banque-Finance-Assurance est très proche de la réalité du terrain. J'ai été recrutée par ma banque de stage avant même la fin de mes études." },
    { nom: "Serigne Modou Gaye", role: "Parent d'étudiant", contenu: "Le suivi des étudiants est sérieux et l'administration très réactive. Je recommande ISI à toutes les familles qui veulent un enseignement de qualité pour leurs enfants." },
    { nom: "Aliou Badara Sagna", role: "DSI, entreprise partenaire", contenu: "Nous recrutons régulièrement des diplômés ISI. Ils sont opérationnels immédiatement et ont une vraie culture du projet et du résultat." },
    { nom: "Mame Diarra Bousso", role: "Étudiante en Master Big Data & IA", contenu: "Les projets réels avec les entreprises et les enseignants-chercheurs m'ont permis de construire un vrai portfolio de data scientist." },
  ];
  for (const [i, t] of testimonials.entries()) await prisma.testimonial.create({ data: { ...t, ordre: i, photo: AVATAR(t.nom, i % 2 ? "0b2a5b" : "f26522") } });

  // -------------------------------------------------------------------------
  // FAQ
  // -------------------------------------------------------------------------
  const faqs: [string, string, string][] = [
    ["Admissions", "Quelles sont les conditions d'admission ?", "Pour le BTS et la Licence : être titulaire du Baccalauréat (toutes séries). Pour le Master : être titulaire d'une Licence (Bac+3) ou d'un diplôme équivalent dans le domaine. L'admission se fait sur étude du dossier, suivie d'un entretien pour les Masters."],
    ["Admissions", "Comment se pré-inscrire en ligne ?", "Remplissez le formulaire de pré-inscription sur notre site (5 minutes). Vous recevez immédiatement un numéro de dossier par email, puis un conseiller vous contacte sous 48 heures ouvrées pour finaliser votre inscription."],
    ["Admissions", "Quelles pièces dois-je fournir ?", "Copie légalisée du diplôme (Bac ou dernier diplôme), relevés de notes, copie de la pièce d'identité ou du passeport, extrait de naissance, 2 photos d'identité et le reçu de paiement des frais d'inscription."],
    ["Admissions", "Peut-on intégrer ISI en cours de cursus (passerelle) ?", "Oui. Les titulaires d'un BTS/DUT peuvent intégrer directement la 3ème année de Licence après validation du dossier. Des passerelles existent également entre filières."],
    ["Frais", "Quels sont les frais de scolarité ?", "Les frais varient selon le niveau et la filière : de 500 000 FCFA/an pour les BTS à 1 450 000 FCFA/an pour certains Masters. Les frais d'inscription sont de 40 000 à 75 000 FCFA. Consultez la fiche de chaque formation pour le détail."],
    ["Frais", "Existe-t-il des facilités de paiement ou des bourses ?", "Oui. Les frais de scolarité peuvent être réglés en 3 à 10 mensualités. Des bourses d'excellence (jusqu'à 50 %) sont attribuées aux meilleurs bacheliers et des réductions sont accordées aux fratries."],
    ["Diplômes", "Les diplômes ISI sont-ils reconnus ?", "Oui. Les BTS sont des diplômes d'État. Les Licences et Masters sont accrédités par l'ANAQ-Sup (Autorité Nationale d'Assurance Qualité) et plusieurs Masters sont reconnus par le CAMES, ce qui garantit leur reconnaissance dans toute l'Afrique francophone."],
    ["Vie étudiante", "ISI propose-t-elle des cours du soir ?", "Oui. La plupart des filières sont proposées en cours du jour et en cours du soir (18h-21h) pour les professionnels et les étudiants salariés, notamment sur les campus de Dakar."],
    ["Vie étudiante", "Comment se passe l'insertion professionnelle ?", "Chaque étudiant réalise des stages obligatoires dès la 2ème année. Notre service Relations Entreprises organise un Forum Entreprises annuel et diffuse des offres de stages et d'emploi. 87 % de nos diplômés trouvent un emploi dans les 6 mois."],
    ["Vie étudiante", "Y a-t-il un accompagnement pour le logement ?", "Le service de la vie étudiante oriente les étudiants venant des régions ou de l'étranger vers des résidences et logements partenaires à proximité des campus."],
    ["International", "Puis-je poursuivre mes études à l'étranger après ISI ?", "Oui. Grâce à l'accréditation ANAQ-Sup / CAMES et à nos partenariats académiques, nos diplômés poursuivent régulièrement en Master ou Doctorat en France, au Canada, au Maroc ou en Tunisie."],
    ["International", "ISI accueille-t-elle des étudiants étrangers ?", "Absolument. Nous accueillons chaque année des étudiants de toute l'Afrique de l'Ouest et Centrale. Notre service international vous accompagne dans vos démarches (visa, logement, intégration)."],
  ];
  for (const [i, [categorie, question, reponse]] of faqs.entries()) await prisma.fAQ.create({ data: { categorie, question, reponse, ordre: i } });

  // -------------------------------------------------------------------------
  // Documents
  // -------------------------------------------------------------------------
  const docs: { titre: string; fichier: string; type: DocumentType; description: string; taille: string }[] = [
    { titre: "Brochure Groupe ISI 2026-2027", fichier: "/documents/brochure-groupe-isi-2026-2027.pdf", type: "BROCHURE", description: "Présentation complète du groupe, des départements, des formations et des campus.", taille: "4,2 Mo" },
    { titre: "Fiche de pré-inscription (version papier)", fichier: "/documents/fiche-pre-inscription.pdf", type: "FORMULAIRE", description: "Formulaire à imprimer et à déposer sur l'un de nos campus.", taille: "310 Ko" },
    { titre: "Liste des pièces à fournir", fichier: "/documents/liste-pieces-a-fournir.pdf", type: "FORMULAIRE", description: "Documents nécessaires à la constitution du dossier d'inscription.", taille: "180 Ko" },
    { titre: "Calendrier académique 2026-2027", fichier: "/documents/calendrier-academique-2026-2027.pdf", type: "CALENDRIER", description: "Dates de rentrée, périodes d'examens et vacances.", taille: "250 Ko" },
    { titre: "Règlement intérieur", fichier: "/documents/reglement-interieur.pdf", type: "REGLEMENT", description: "Règles de vie et de discipline applicables sur les campus.", taille: "520 Ko" },
    { titre: "Plaquette Formation Continue & Entreprises", fichier: "/documents/plaquette-formation-continue.pdf", type: "PLAQUETTE", description: "Catalogue des formations courtes, certifications et offres intra-entreprise.", taille: "2,8 Mo" },
  ];
  for (const [i, d] of docs.entries()) await prisma.document.create({ data: { ...d, format: "PDF", ordre: i, telechargements: Math.floor(Math.random() * 800) } });

  // -------------------------------------------------------------------------
  // Config ERP (désactivée par défaut, à compléter dans /admin/settings)
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
      notifyEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? "admissions@groupeisi.com",
    },
    update: {},
  });

  // -------------------------------------------------------------------------
  // Quelques inscriptions de démonstration
  // -------------------------------------------------------------------------
  const demo = [
    { civilite: "M" as const, prenom: "Souleymane", nom: "Diouf", email: "souleymane.diouf@example.com", telephone: "+221 77 123 45 67", prog: "licence-genie-logiciel", camp: "dakar-sacre-coeur", statut: "NOUVELLE" as const, erp: "PENDING" as const },
    { civilite: "MLLE" as const, prenom: "Astou", nom: "Ndiaye", email: "astou.ndiaye@example.com", telephone: "+221 78 234 56 78", prog: "master-big-data-intelligence-artificielle", camp: "dakar-sacre-coeur", statut: "EN_COURS" as const, erp: "SYNCED" as const },
    { civilite: "M" as const, prenom: "Moussa", nom: "Ba", email: "moussa.ba@example.com", telephone: "+221 76 345 67 89", prog: "bts-reseaux-telecommunications", camp: "keur-massar", statut: "ACCEPTEE" as const, erp: "SYNCED" as const },
    { civilite: "MME" as const, prenom: "Fatoumata", nom: "Kane", email: "fatoumata.kane@example.com", telephone: "+222 22 34 56 78", prog: "licence-banque-finance-assurance", camp: "nouakchott", statut: "NOUVELLE" as const, erp: "FAILED" as const },
  ];
  for (const [i, d] of demo.entries()) {
    const created = await prisma.inscription.create({
      data: {
        numero: `ISI-${new Date().getFullYear()}-${String(i + 1).padStart(5, "0")}`,
        civilite: d.civilite, prenom: d.prenom, nom: d.nom, email: d.email, telephone: d.telephone,
        dateNaissance: new Date(2004 - i, 3 + i, 12), lieuNaissance: "Dakar", nationalite: "Sénégalaise",
        adresse: "Rue 10 x 15, Médina", ville: "Dakar", pays: "Sénégal",
        niveauEtudes: "BAC", serieBac: "S2", anneeBac: 2025, etablissementOrigine: "Lycée Blaise Diagne",
        programmeId: programmeIds[d.prog], campusId: campus[d.camp].id, niveauEntree: "1ère année", rentree: "Octobre 2026", modeFormation: "PRESENTIEL",
        sourceConnaissance: "RESEAUX_SOCIAUX", motivation: "Je souhaite devenir un professionnel reconnu du numérique.", accepteConditions: true,
        statut: d.statut, erpSyncStatus: d.erp, erpAttempts: d.erp === "FAILED" ? 3 : d.erp === "SYNCED" ? 1 : 0,
        erpLastError: d.erp === "FAILED" ? "HTTP 503 Service Unavailable" : null,
        erpProspectId: d.erp === "SYNCED" ? `PRS-${1000 + i}` : null, erpSyncedAt: d.erp === "SYNCED" ? new Date() : null,
        emailEnvoye: true, createdAt: daysAgo(i * 2),
      },
    });
    if (d.erp === "SYNCED") {
      await prisma.eRPMapping.create({ data: { inscriptionId: created.id, erpEntityType: "prospect", erpEntityId: `PRS-${1000 + i}`, erpUrl: `https://erp.groupeisi.com/prospects/${1000 + i}` } });
      await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action: "createProspect", status: "SUCCESS", message: "POST /api/prospects → 201", inscriptionId: created.id, statusCode: 201, durationMs: 340, httpMethod: "POST", endpoint: "https://erp.groupeisi.com/api/prospects" } });
    }
    if (d.erp === "FAILED") {
      for (let a = 1; a <= 3; a++) await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action: "createProspect", status: "ERROR", message: "HTTP 503 Service Unavailable", inscriptionId: created.id, attempt: a, statusCode: 503, durationMs: 1200, httpMethod: "POST", endpoint: "https://erp.groupeisi.com/api/prospects", errorMessage: "HTTP 503 Service Unavailable" } });
    }
  }
  await prisma.eRPLog.create({ data: { direction: "INBOUND", action: "webhook:prospect.updated", status: "SUCCESS", message: "Statut prospect mis à jour : qualified", requestPayload: { event: "prospect.updated", data: { id: "PRS-1001", status: "qualified" } } } });

  console.log(`✅ Seed terminé. Admin : ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
