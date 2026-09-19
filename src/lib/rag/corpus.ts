import { prisma } from "@/lib/prisma";
import { NIVEAU_LABELS } from "@/lib/constants";
import { formatFCFA, formatDate } from "@/lib/utils";
import type { Passage } from "./types";

/**
 * Construction de la base de connaissances du chatbot.
 *
 * Tout le contenu du site est déjà en base : le corpus est donc dérivé de
 * Prisma plutôt que d'un aspirateur de pages. L'avantage est double — il reste
 * synchronisé avec ce que voit le visiteur, et chaque passage porte l'URL de la
 * page correspondante, ce qui permet de citer une source cliquable.
 *
 * S'y ajoutent les faits qui ne vivent pas en base : procédure d'admission,
 * modalités de paiement, plan du site pour guider la navigation.
 */

const htmlEnTexte = (html: string | null | undefined): string =>
  (html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(?:#39|apos|rsquo|#8217);/g, "'")
    .replace(/&(?:quot|laquo|raquo);/g, '"')
    .replace(/\s*\.\s*\./g, ".")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Assemble des fragments en un paragraphe, en ignorant les vides.
 *
 * Accepte les valeurs produites par `condition && texte` : la condition peut
 * valoir `0` ou `null` quand le champ testé est un nombre ou une relation.
 */
const lignes = (...parties: (string | number | null | undefined | false)[]): string =>
  parties.filter((p): p is string => typeof p === "string" && p.trim().length > 0).join("\n");

/** Coupe un passage trop long en tranches qui se chevauchent légèrement. */
function decouper(texte: string, max = 1400, chevauchement = 160): string[] {
  if (texte.length <= max) return [texte];
  const morceaux: string[] = [];
  let debut = 0;
  while (debut < texte.length) {
    let fin = Math.min(debut + max, texte.length);
    if (fin < texte.length) {
      const coupe = texte.lastIndexOf(". ", fin);
      if (coupe > debut + max * 0.5) fin = coupe + 1;
    }
    morceaux.push(texte.slice(debut, fin).trim());
    if (fin >= texte.length) break;
    // Le chevauchement repart sur une phrase entière : sans cela, la tranche
    // suivante commence au milieu d'un mot, ce qui se voit dans les citations.
    const recul = texte.lastIndexOf(". ", fin - chevauchement);
    debut = recul > debut ? recul + 2 : fin;
  }
  return morceaux.filter(Boolean);
}

/**
 * Connaissances qui ne vivent pas en base : plan du site, procédures et pages
 * dont le contenu est écrit directement dans les composants.
 */
const CONNAISSANCES_STATIQUES: Passage[] = [
  {
    id: "plan-site",
    type: "pratique",
    titre: "Se repérer sur le site",
    url: "/",
    poids: 0.9,
    motsCles: ["navigation", "trouver", "page", "menu", "ou aller", "plan du site"],
    texte: lignes(
      "Plan du site du Groupe ISI et rôle de chaque page :",
      "- /formations : catalogue de toutes les formations, filtrable par campus, département et niveau. Chaque formation a sa fiche à /formations/[slug].",
      "- /departements : les quatre départements et les formations de chacun.",
      "- /campus : tous les campus ; chaque campus a sa fiche à /campus/[slug] avec adresse, équipements et carte.",
      "- /frais-d-etudes : grille tarifaire par cycle (coût annuel, droits d'inscription, mensualité).",
      "- /condition-admission : conditions d'admission, pièces à fournir et procédure.",
      "- /preinscription : formulaire de préinscription en ligne, en six étapes.",
      "- /formation-en-ligne : l'offre à distance et l'accès à la plateforme e-learning.",
      "- /actualites : actualités de l'institut. /evenements : agenda.",
      "- /alumnis : réseau des diplômés. /equipe : direction et enseignants. /temoignages : témoignages et interviews.",
      "- /a-propos : présentation ; /a-propos/histoire, /a-propos/administration, /a-propos/localisation ; /mot-du-president.",
      "- /librairie et /telechargements : documents et brochures. /galerie : photos. /faq : questions fréquentes. /contact : nous écrire.",
    ),
  },
  {
    id: "procedure-preinscription",
    type: "pratique",
    titre: "Comment se préinscrire",
    url: "/preinscription",
    motsCles: ["s'inscrire", "candidater", "postuler", "dossier", "procédure", "étapes", "comment faire"],
    texte: lignes(
      "La préinscription se fait en ligne sur /preinscription, en six étapes : identité, coordonnées, parcours scolaire, formation et campus souhaités, tuteur ou responsable légal, puis finalisation.",
      "Le formulaire prend environ cinq minutes et le brouillon est sauvegardé automatiquement dans le navigateur : on peut le reprendre plus tard.",
      "À la validation, un numéro de dossier est attribué et un courriel de confirmation est envoyé immédiatement.",
      "Un conseiller du service des admissions rappelle ensuite sous quarante-huit heures ouvrées pour finaliser l'inscription.",
      "Les pièces justificatives se déposent au campus choisi ou s'envoient par courriel.",
      "La préinscription est gratuite et n'engage à rien.",
    ),
  },
  {
    id: "formation-a-distance",
    type: "pratique",
    titre: "Étudier à distance",
    url: "/formation-en-ligne",
    poids: 1.15,
    motsCles: ["distance", "en ligne", "foad", "e-learning", "elearning", "distanciel", "a son rythme", "plateforme"],
    texte: lignes(
      "Le Groupe ISI propose une offre entièrement à distance, présentée sur /formation-en-ligne.",
      "Licences à distance : Génie Informatique, Intelligence Artificielle et Ingénierie de données, Réseaux et Systèmes, Finance et Comptabilité.",
      "Masters à distance : les mêmes quatre domaines.",
      "Certificats courts : certification en Python, certificat en Data Management, certificat en Data Visualisation.",
      "Les cours et leurs enregistrements restent accessibles pendant toute la durée de la formation, chacun avance à son rythme, et les diplômes délivrés sont les mêmes qu'en présentiel, reconnus par l'ANAQ-Sup et le CAMES.",
      "L'admission est continue : on peut s'inscrire toute l'année. La plateforme d'apprentissage est accessible sur elearning-groupeisi.com.",
      "Pour s'inscrire à distance, utiliser le formulaire de préinscription en choisissant le mode « En ligne / à distance ».",
    ),
  },
  {
    id: "conditions-admission",
    type: "pratique",
    titre: "Conditions d'admission",
    url: "/condition-admission",
    poids: 1.15,
    motsCles: ["admission", "condition", "prerequis", "pieces", "dossier", "bac", "equivalence", "niveau requis"],
    texte: lignes(
      "Les conditions d'admission sont détaillées sur /condition-admission.",
      "Pour une licence professionnelle : baccalauréat, toutes séries, ou tout diplôme admis en équivalence ou en dispense. L'admission se fait sur étude de dossier.",
      "Pour entrer directement en deuxième année de licence, il faut avoir capitalisé au moins 70 % des crédits de la première année ; pour la troisième année, avoir validé la première année et capitalisé au moins 70 % de la deuxième. Les titulaires d'un Bac+2 ou d'un diplôme équivalent peuvent être admis en troisième année.",
      "Pour un master : licence (Bac+3) dans le domaine ou diplôme équivalent, admission sur étude de dossier et entretien avec le chef de département.",
      "Les pièces habituellement demandées : copie du diplôme, relevés de notes, pièce d'identité, photos d'identité et fiche de préinscription.",
      "Chaque fiche formation précise ses propres conditions d'admission.",
    ),
  },
  {
    id: "reseau-alumni",
    type: "pratique",
    titre: "Le réseau des diplômés",
    url: "/alumnis",
    poids: 1.05,
    motsCles: ["alumni", "ancien etudiant", "anciens eleves", "diplomes", "promotion", "devenir", "apres isi"],
    texte: lignes(
      "Le réseau alumni du Groupe ISI rassemble les anciens étudiants de l'institut, présenté sur /alumnis.",
      "Les portraits de diplômés, leur promotion, leur parcours et leur poste actuel y figurent, avec des interviews vidéo.",
      "Plus de 80 % des diplômés décrochent leur premier emploi dès la fin de leurs études. La cellule COIP anime la plateforme des anciens et relaie les offres de stage et d'emploi.",
      "Les témoignages d'étudiants et de diplômés sont réunis sur /temoignages.",
    ),
  },
  {
    id: "vie-etudiante",
    type: "pratique",
    titre: "La vie étudiante",
    url: "/galerie",
    poids: 0.9,
    motsCles: ["vie etudiante", "association", "club", "sport", "ambiance", "amicale", "activites"],
    texte: lignes(
      "La vie étudiante du Groupe ISI s'organise autour d'associations et de clubs : l'AMEA (Amicale des Étudiants et Anciens Étudiants), ITShare, l'English Club et d'autres.",
      "Les campus accueillent des salles multi-associations et le groupe organise chaque année des tournois inter-campus ainsi que les 72H du Groupe ISI.",
      "La cellule COIP accompagne chaque étudiant de son entrée jusqu'à son insertion professionnelle : orientation, stages, offres d'emploi et réseau des diplômés.",
      "Les photos de la vie de l'institut sont sur /galerie, les associations et évènements sur /actualites et /evenements.",
    ),
  },
  {
    id: "paiement-scolarite",
    type: "pratique",
    titre: "Payer sa scolarité",
    url: "/frais-d-etudes",
    motsCles: ["payer", "paiement", "echelonner", "tranche", "mensualite", "versement"],
    texte: lignes(
      "Les frais de scolarité se règlent mensuellement : la grille complète, par cycle et par formation, figure sur /frais-d-etudes.",
      "Trois montants distincts apparaissent sur chaque fiche formation : les droits d'inscription, payés une fois à l'entrée ; le coût annuel de la scolarité ; et la mensualité, qui étale ce coût sur l'année.",
      "Pour une demande d'échelonnement particulière, il faut contacter le service des admissions.",
    ),
  },
];

/** Construit la base de connaissances complète depuis la base de données. */
export async function construireCorpus(): Promise<Passage[]> {
  const [settings, programmes, campus, departements, personnes, posts, evenements, faqs, temoignages, alumnis, documents] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.programme.findMany({ where: { isActive: true }, include: { departement: true, campus: true }, orderBy: { ordre: "asc" } }),
      prisma.campus.findMany({ where: { isActive: true }, include: { _count: { select: { programmes: true } } }, orderBy: { ordre: "asc" } }),
      prisma.departement.findMany({ where: { isActive: true }, include: { programmes: { where: { isActive: true }, select: { titre: true, niveau: true } } } }),
      prisma.personne.findMany({ where: { isActive: true }, include: { departement: true, campus: true }, orderBy: { ordre: "asc" } }),
      prisma.post.findMany({ where: { isPublished: true }, include: { categorie: true }, orderBy: { publishedAt: "desc" }, take: 40 }),
      prisma.evenement.findMany({ where: { isPublished: true }, include: { campus: true }, orderBy: { dateDebut: "desc" }, take: 30 }),
      prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { ordre: "asc" } }),
      prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { ordre: "asc" } }),
      prisma.alumni.findMany({ where: { isActive: true }, orderBy: { promotion: "desc" } }),
      prisma.document.findMany({ where: { isActive: true }, orderBy: { ordre: "asc" } }),
    ]);

  const passages: Passage[] = [...CONNAISSANCES_STATIQUES];

  // ---- L'institut ---------------------------------------------------------
  if (settings) {
    passages.push({
      id: "institution-presentation",
      type: "institution",
      titre: `${settings.siteName} en bref`,
      url: "/a-propos",
      poids: 1.2,
      motsCles: ["isi", "institut superieur d'informatique", "qui etes vous", "presentation", "anaq", "cames"],
      texte: lignes(
        `${settings.siteName} — ${settings.tagline ?? ""}`,
        settings.description,
        `Chiffres clés : ${settings.statAnnees} ans d'existence, ${settings.statEtudiants} étudiants, ${settings.statCampus} campus, ${settings.statProgrammes} formations, ${settings.statInsertion} % d'insertion professionnelle, ${settings.statPartenaires} partenaires.`,
        `Année académique en cours : ${settings.anneeAcademique}. Rentrées possibles : ${settings.rentreeOptions.join(", ")}.`,
        settings.inscriptionsOuvertes ? "Les préinscriptions sont actuellement ouvertes." : "Les préinscriptions sont actuellement fermées.",
        "L'institut est sous la tutelle du Ministère de l'Enseignement supérieur, qui signe les diplômes, sous le contrôle de l'ANAQ-Sup. Les diplômes de licence et de master sont reconnus par l'ANAQ-Sup et par le CAMES.",
      ),
    });

    passages.push({
      id: "institution-contact",
      type: "pratique",
      titre: "Nous contacter",
      url: "/contact",
      poids: 1.25,
      motsCles: ["telephone", "numero", "email", "mail", "adresse", "joindre", "appeler", "whatsapp", "horaires", "recrutement"],
      texte: lignes(
        `Adresse du siège : ${settings.address ?? ""}.`,
        settings.phone && `Téléphone : ${settings.phone}.`,
        settings.phone2 && `Second numéro : ${settings.phone2}.`,
        settings.whatsapp && `WhatsApp : ${settings.whatsapp}.`,
        settings.email && `Courriel général : ${settings.email}.`,
        settings.emailAdmissions && `Admissions : ${settings.emailAdmissions}.`,
        settings.emailRecrutement && `Candidatures et recrutement : ${settings.emailRecrutement}.`,
        settings.horaires && `Horaires : ${settings.horaires}.`,
        "Le formulaire de contact se trouve sur /contact. Chaque campus dispose aussi de ses propres coordonnées sur sa fiche.",
      ),
    });
  }

  // ---- Formations ---------------------------------------------------------
  for (const p of programmes) {
    const admission = (p.conditionsAdmission ?? "").split("\n").filter(Boolean);
    const ues = (p.unitesEnseignement as { intitule: string; contenu?: string }[] | null) ?? [];
    const texte = lignes(
      `Formation : ${p.titre}. Niveau : ${NIVEAU_LABELS[p.niveau]}. Durée : ${p.duree}.`,
      p.departement && `Département : ${p.departement.nom}.`,
      p.campus.length > 0 && `Proposée sur : ${p.campus.map((c) => c.nom).join(", ")}.`,
      p.accroche && `En une phrase : ${p.accroche}`,
      p.description,
      htmlEnTexte(p.contenu),
      p.credits && `Crédits : ${p.credits}. Semestres : ${p.semestres ?? "—"}. Volume horaire : ${p.volumeHoraire ?? "—"} heures. Unités d'enseignement : ${p.nbUE ?? ues.length}.`,
      p.objectifs.length > 0 && `Objectifs : ${p.objectifs.join(" ; ")}.`,
      p.competences.length > 0 && `Compétences visées : ${p.competences.join(" ; ")}.`,
      p.debouches.length > 0 && `Débouchés : ${p.debouches.join(" ; ")}.`,
      ues.length > 0 && `Unités d'enseignement : ${ues.map((u) => u.intitule).join(" ; ")}.`,
      admission.length > 0 && `Conditions d'admission : ${admission.join(" ")}`,
      `Frais : droits d'inscription ${formatFCFA(p.fraisInscription)}, coût annuel ${formatFCFA(p.fraisScolarite)}, mensualité ${formatFCFA(p.fraisMensualite)}.`,
      p.diplome && `Diplôme délivré : ${p.diplome}. Accréditation : ${p.accreditation ?? "ANAQ-Sup"}.`,
      p.structure,
    );

    for (const [i, morceau] of decouper(texte).entries()) {
      passages.push({
        id: `formation-${p.slug}-${i}`,
        type: "formation",
        titre: p.titre,
        url: `/formations/${p.slug}`,
        poids: 1.15,
        motsCles: [p.titre, NIVEAU_LABELS[p.niveau], p.departement?.nom ?? "", p.accroche ?? ""],
        texte: morceau,
      });
    }
  }

  // ---- Campus -------------------------------------------------------------
  for (const c of campus) {
    const texte = lignes(
      `Campus : ${c.nom}, à ${c.ville} (${c.pays}).${c.isSiege ? " C'est le campus siège du groupe." : ""}`,
      `Adresse : ${c.adresse}.`,
      c.telephone && `Téléphone : ${c.telephone}.`,
      c.email && `Courriel : ${c.email}.`,
      c.siteUrl && `Site web du campus : ${c.siteUrl}.`,
      c.description,
      htmlEnTexte(c.contenu),
      c.equipements.length > 0 && `Équipements : ${c.equipements.join(" ; ")}.`,
      c.directeurNom && `Responsable : ${c.directeurNom}${c.directeurPoste ? `, ${c.directeurPoste}` : ""}.`,
      c.mission.length > 0 && `Mission : ${c.mission.join(" ; ")}.`,
      c._count.programmes > 0 && `${c._count.programmes} formations y sont proposées.`,
    );
    for (const [i, morceau] of decouper(texte).entries()) {
      passages.push({
        id: `campus-${c.slug}-${i}`,
        type: "campus",
        titre: c.nom,
        url: `/campus/${c.slug}`,
        poids: 1.1,
        motsCles: [c.nom, c.ville, c.zone ?? ""],
        texte: morceau,
      });
    }
  }

  // ---- Départements -------------------------------------------------------
  for (const d of departements) {
    passages.push({
      id: `departement-${d.slug}`,
      type: "departement",
      titre: d.nom,
      url: `/departements/${d.slug}`,
      motsCles: [d.nom, d.accroche ?? ""],
      texte: lignes(
        `Département : ${d.nom}.`,
        d.accroche,
        d.description,
        htmlEnTexte(d.contenu),
        d.programmes.length > 0 && `Formations du département : ${d.programmes.map((p) => p.titre).join(" ; ")}.`,
        d.email && `Contact : ${d.email}${d.telephone ? `, ${d.telephone}` : ""}.`,
      ),
    });
  }

  // ---- Équipe -------------------------------------------------------------
  for (const p of personnes) {
    passages.push({
      id: `personne-${p.slug}`,
      type: "personne",
      titre: `${p.prenom} ${p.nom}`,
      url: `/equipe/${p.slug}`,
      poids: p.type === "DIRECTION" ? 1.2 : 1, // « qui dirige l'institut » doit ramener la direction
      motsCles: [`${p.prenom} ${p.nom}`, p.poste, p.departement?.nom ?? "", p.type === "DIRECTION" ? "direction dirigeant" : ""],
      texte: lignes(
        `${p.prenom} ${p.nom} — ${p.poste}.`,
        p.departement && `Département : ${p.departement.nom}.`,
        p.campus && `Campus : ${p.campus.nom}.`,
        p.bio,
        p.specialites.length > 0 && `Spécialités : ${p.specialites.join(", ")}.`,
        p.email && `Courriel : ${p.email}.`,
      ),
    });
  }

  // ---- Actualités et évènements -------------------------------------------
  for (const a of posts) {
    const texte = lignes(
      `Actualité${a.publishedAt ? ` du ${formatDate(a.publishedAt)}` : ""} : ${a.titre}.`,
      a.categorie && `Catégorie : ${a.categorie.nom}.`,
      a.extrait,
      htmlEnTexte(a.contenu),
    );
    for (const [i, morceau] of decouper(texte).entries()) {
      passages.push({
        id: `actualite-${a.slug}-${i}`,
        type: "actualite",
        titre: a.titre,
        url: `/actualites/${a.slug}`,
        poids: 0.95,
        motsCles: [a.titre, a.categorie?.nom ?? "", ...a.tags],
        texte: morceau,
      });
    }
  }

  for (const e of evenements) {
    passages.push({
      id: `evenement-${e.slug}`,
      type: "evenement",
      titre: e.titre,
      url: `/evenements/${e.slug}`,
      poids: 0.95,
      motsCles: [e.titre, e.type ?? "", e.lieu ?? ""],
      texte: lignes(
        `Évènement : ${e.titre}, le ${formatDate(e.dateDebut)}${e.heure ? ` à ${e.heure}` : ""}.`,
        e.lieu && `Lieu : ${e.lieu}.`,
        e.campus && `Campus : ${e.campus.nom}.`,
        e.description,
        htmlEnTexte(e.contenu),
      ),
    });
  }

  // ---- Questions fréquentes ------------------------------------------------
  for (const f of faqs) {
    passages.push({
      id: `faq-${f.id}`,
      type: "faq",
      titre: f.question,
      url: "/faq",
      poids: 1.3, // une question fréquente répond souvent mieux qu'une fiche
      motsCles: [f.question, f.categorie],
      texte: `Question fréquente (${f.categorie}) : ${f.question}\nRéponse : ${f.reponse}`,
    });
  }

  // ---- Témoignages et alumni ----------------------------------------------
  for (const t of temoignages) {
    passages.push({
      id: `temoignage-${t.id}`,
      type: "temoignage",
      titre: `Témoignage de ${t.nom}`,
      url: "/temoignages",
      poids: 0.8,
      texte: lignes(`${t.nom}, ${t.role}${t.entreprise ? ` chez ${t.entreprise}` : ""} : « ${t.contenu} »`),
    });
  }

  for (const a of alumnis) {
    passages.push({
      id: `alumni-${a.slug}`,
      type: "alumni",
      titre: `${a.prenom} ${a.nom}`,
      url: `/alumni/${a.slug}`,
      poids: 0.85,
      motsCles: [`${a.prenom} ${a.nom}`, a.programme, "alumni ancien etudiant diplome"],
      texte: lignes(
        `Diplômé : ${a.prenom} ${a.nom}, promotion ${a.promotion}, ${a.programme}.`,
        a.poste && `Aujourd'hui ${a.poste}${a.entreprise ? ` chez ${a.entreprise}` : ""}${a.ville ? `, à ${a.ville}` : ""}.`,
        a.temoignage,
        a.parcours,
      ),
    });
  }

  // ---- Documents ----------------------------------------------------------
  for (const d of documents) {
    passages.push({
      id: `document-${d.id}`,
      type: "document",
      titre: d.titre,
      url: "/telechargements",
      poids: 0.85,
      motsCles: [d.titre, d.categorie ?? "", "brochure", "telecharger", "pdf"],
      texte: lignes(`Document téléchargeable : ${d.titre}${d.format ? ` (${d.format}${d.taille ? `, ${d.taille}` : ""})` : ""}.`, d.description, `Disponible sur la page Téléchargements.`),
    });
  }

  return passages;
}
