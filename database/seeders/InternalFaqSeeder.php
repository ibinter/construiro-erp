<?php

namespace Database\Seeders;

use App\Models\InternalFaq;
use Illuminate\Database\Seeder;

class InternalFaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [

            // ══════════════════════════════════════════════════════════════
            // DÉMARRAGE RAPIDE (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'demarrage',
                'sort_order' => 1,
                'question'   => 'Comment créer mon compte CONSTRUIRO ?',
                'answer'     => "Rendez-vous sur construiro.com et cliquez sur « Essai gratuit ». Renseignez le nom de votre entreprise, votre email professionnel et un mot de passe. Votre espace est créé instantanément. Un email de confirmation vous est envoyé ; cliquez sur le lien pour activer votre compte.",
                'keywords'   => 'inscription, compte, créer, enregistrement, email',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 2,
                'question'   => 'Comment activer et prolonger mon essai gratuit de 30 jours ?',
                'answer'     => "Votre essai de 30 jours démarre automatiquement à l'inscription, sans carte bancaire. Tous les modules sont actifs (Projets, RH, Facturation, Stocks, SARA, etc.). À J-3, un email vous propose de choisir un plan. Aucune interruption n'a lieu à la fin de l'essai : vos données sont conservées  90 jours supplémentaires.",
                'keywords'   => 'essai, gratuit, 30 jours, trial, activer, prolonger',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 3,
                'question'   => 'Comment créer mon premier projet dans CONSTRUIRO ?',
                'answer'     => "Depuis le tableau de bord, cliquez sur « Nouveau projet » (menu Projets → Projets). Renseignez le nom, le client, les dates de début et fin, le budget prévu et le chef de projet. CONSTRUIRO génère automatiquement un code projet unique. Vous pouvez ensuite ajouter les tâches, membres et documents.",
                'keywords'   => 'premier projet, démarrer, créer projet, onboarding',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 4,
                'question'   => 'Comment importer mes données existantes (clients, fournisseurs, employés) ?',
                'answer'     => "CONSTRUIRO propose des imports CSV/Excel pour chaque module. Allez dans le module concerné (ex. RH → Employés), cliquez sur le bouton « Importer » et téléchargez le modèle Excel fourni. Remplissez-le avec vos données, puis importez-le. Le système valide chaque ligne et signale les erreurs sans bloquer les lignes correctes.",
                'keywords'   => 'import, CSV, Excel, données existantes, migration, importer',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 5,
                'question'   => 'Comment inviter mes collègues dans mon espace CONSTRUIRO ?',
                'answer'     => "Allez dans Administration → Utilisateurs → Inviter un utilisateur. Saisissez l'email de votre collègue, choisissez son rôle (Directeur, Chef de projet, Comptable, RH, Magasinier, etc.) et ses modules accessibles. Il reçoit un email avec un lien d'activation valable 48 heures. Vous pouvez inviter autant d'utilisateurs que votre plan le permet.",
                'keywords'   => 'inviter, collègues, équipe, utilisateurs, accès',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 6,
                'question'   => 'Comment configurer les rôles et droits d\'accès ?',
                'answer'     => "Dans Administration → Rôles & Permissions, vous pouvez créer des rôles personnalisés ou modifier les rôles prédéfinis. Pour chaque rôle, cochez/décochez les permissions par module (voir, créer, modifier, supprimer, exporter). Les rôles prédéfinis sont : Super Admin, Directeur, Chef de projet, Comptable, RH, Magasinier, Visiteur.",
                'keywords'   => 'rôles, permissions, droits, accès, super admin, sécurité',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 7,
                'question'   => 'Comment changer la langue de l\'interface ?',
                'answer'     => "Cliquez sur votre avatar en haut à droite → Préférences → Langue. CONSTRUIRO est disponible en Français, Anglais, Arabe et Portugais. La langue peut aussi être forcée au niveau de l'organisation par un administrateur dans Administration → Préférences système → Langue par défaut.",
                'keywords'   => 'langue, français, anglais, traduction, interface, i18n',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 8,
                'question'   => 'Comment réinitialiser mon mot de passe ?',
                'answer'     => "Sur la page de connexion, cliquez sur « Mot de passe oublié ». Entrez votre email. Un lien de réinitialisation valable 60 minutes vous est envoyé. Cliquez sur le lien, définissez votre nouveau mot de passe (minimum 8 caractères, 1 majuscule, 1 chiffre). Si vous ne recevez pas l'email, vérifiez vos spams ou contactez votre administrateur.",
                'keywords'   => 'mot de passe, réinitialiser, oublié, connexion, password',
            ],
            [
                'category'   => 'demarrage',
                'sort_order' => 9,
                'question'   => 'Comment configurer le profil de mon entreprise (logo, adresse, infos légales) ?',
                'answer'     => "Allez dans Administration → Mon entreprise. Vous pouvez renseigner le nom commercial, le numéro RCCM, l'adresse complète, le téléphone, l'email, le site web, et téléverser votre logo (PNG ou SVG, fond transparent recommandé). Ces informations apparaissent automatiquement sur vos devis, factures et documents RH.",
                'keywords'   => 'logo, entreprise, profil, adresse, RCCM, légal, infos société',
            ],

            // ══════════════════════════════════════════════════════════════
            // GESTION DES PROJETS (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'projets',
                'sort_order' => 1,
                'question'   => 'Comment créer un projet et configurer ses paramètres ?',
                'answer'     => "Menu Projets → Projets → Nouveau projet. Renseignez : nom du projet, client (lié au module CRM), maître d'ouvrage, type (construction, rénovation, infrastructure...), localisation géographique, dates prévues, budget global HT. Vous pouvez aussi activer le mode « Projet confidentiel » pour restreindre la visibilité aux seuls membres affectés.",
                'keywords'   => 'créer projet, nouveau, configurer, paramètres projet',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 2,
                'question'   => 'Comment ajouter et organiser les tâches d\'un projet ?',
                'answer'     => "Dans la fiche projet, cliquez sur l'onglet « Tâches ». Créez des phases (ex. Fondations, Gros œuvre, Second œuvre) puis des tâches dans chaque phase. Chaque tâche a : un responsable, une durée, des dépendances (pour le Gantt automatique), un statut (À faire / En cours / Terminé / Bloqué) et des pièces jointes.",
                'keywords'   => 'tâches, phases, organiser, planning, dépendances, Gantt',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 3,
                'question'   => 'Comment affecter les membres de l\'équipe à un projet ?',
                'answer'     => "Dans la fiche projet, onglet « Équipe », cliquez sur « Ajouter un membre ». Sélectionnez l'utilisateur ou l'employé, son rôle dans le projet (Chef, Technicien, Ouvrier, etc.) et la période d'affectation. Le membre voit alors le projet dans son tableau de bord et peut enregistrer ses pointages et avancement.",
                'keywords'   => 'équipe, affecter, membres, rôle projet, pointage',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 4,
                'question'   => 'Comment suivre l\'avancement d\'un projet en temps réel ?',
                'answer'     => "Le tableau de bord projet affiche : le taux d'avancement global (calculé automatiquement à partir des tâches), les jalons atteints vs prévus, le consommé budgétaire vs budgété, le planning Gantt interactif, et les dernières alertes (retard, dépassement budget). Le journal de chantier permet aux équipes terrain de soumettre des rapports quotidiens.",
                'keywords'   => 'avancement, suivi, Gantt, jalons, tableau de bord projet, journal chantier',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 5,
                'question'   => 'Comment clôturer un projet terminé ?',
                'answer'     => "Dans la fiche projet → bouton « Clôturer le projet ». CONSTRUIRO vous demande de confirmer : toutes les tâches ouvertes seront fermées, les stocks non consommés signalés, et un rapport de clôture PDF généré automatiquement. Le projet passe en statut « Terminé » et n'est plus modifiable (sauf par un administrateur).",
                'keywords'   => 'clôturer, fermer projet, terminé, rapport de clôture',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 6,
                'question'   => 'Comment générer un rapport de projet ?',
                'answer'     => "Menu Rapports → Projets, ou depuis la fiche projet → onglet « Rapports ». Choisissez le type : Rapport d'avancement, Rapport budgétaire, Rapport main-d'œuvre, Rapport matériaux. Sélectionnez la période et le format (PDF ou Excel). Le rapport est généré instantanément et peut être envoyé par email directement depuis CONSTRUIRO.",
                'keywords'   => 'rapport projet, avancement, budgétaire, main-d\'œuvre, exporter',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 7,
                'question'   => 'Comment gérer le budget d\'un projet ?',
                'answer'     => "Dans la fiche projet, onglet « Budget », définissez le budget par poste (main-d'œuvre, matériaux, équipements, sous-traitance, frais généraux). Au fur et à mesure des dépenses enregistrées (factures fournisseurs, sorties de stock, paie), CONSTRUIRO calcule en temps réel le consommé, le reste à dépenser et l'écart budgétaire.",
                'keywords'   => 'budget, poste budgétaire, consommé, écart, main-d\'œuvre, matériaux',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 8,
                'question'   => 'Comment attacher et gérer les documents d\'un projet (plans, contrats, photos) ?',
                'answer'     => "Dans la fiche projet, onglet « Documents ». Glissez-déposez vos fichiers (PDF, DWG, JPG, DOCX, XLSX) ou cliquez sur « Ajouter ». Organisez-les par catégories (Plans, Contrats, PV réception, Photos chantier...). Chaque document a un historique de versions. Vous pouvez définir des droits d'accès par document (visible par tous / membres du projet uniquement).",
                'keywords'   => 'documents, plans, contrats, photos, pièces jointes, gestion documentaire',
            ],
            [
                'category'   => 'projets',
                'sort_order' => 9,
                'question'   => 'Comment archiver un ancien projet ?',
                'answer'     => "Dans la fiche projet → menu « Actions » → « Archiver ». Le projet disparaît de la liste active mais reste accessible via le filtre « Archivés ». Toutes les données (tâches, documents, budget, équipe) sont conservées indéfiniment. Un projet archivé peut être réactivé à tout moment par un administrateur.",
                'keywords'   => 'archiver, ancien projet, historique, réactiver',
            ],

            // ══════════════════════════════════════════════════════════════
            // DEVIS & FACTURATION (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'facturation',
                'sort_order' => 1,
                'question'   => 'Comment créer un devis client ?',
                'answer'     => "Allez dans Facturation → Devis → Nouveau devis. Sélectionnez le client (ou créez-le à la volée), le projet associé, les conditions de paiement et la date de validité. Ajoutez les lignes avec description, quantité et prix unitaire HT. CONSTRUIRO calcule automatiquement les totaux HT/TVA/TTC. Cliquez sur « Envoyer par email » pour transmettre le devis en PDF signé directement au client.",
                'keywords'   => 'devis, créer, client, lignes, TVA, envoyer PDF',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 2,
                'question'   => 'Comment transformer un devis accepté en facture ?',
                'answer'     => "Depuis la liste des devis, cliquez sur le devis avec le statut « Accepté », puis sur le bouton « Convertir en facture ». CONSTRUIRO reprend automatiquement toutes les lignes, le client et le projet. Vous pouvez modifier les quantités si nécessaire (facture partielle), choisir la date et le numéro de facture, puis valider. La facture est immédiatement dans l'espace Facturation.",
                'keywords'   => 'devis, facture, convertir, transformer, accepté',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 3,
                'question'   => 'Comment enregistrer un paiement client ?',
                'answer'     => "Ouvrez la facture concernée → bouton « Enregistrer un paiement ». Sélectionnez le mode (virement, chèque, espèces, mobile money...), la date de réception et le montant (paiement partiel possible). CONSTRUIRO met à jour automatiquement le solde dû, génère un reçu PDF et met à jour la trésorerie du projet.",
                'keywords'   => 'paiement, encaissement, reçu, virement, chèque, mobile money, solde',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 4,
                'question'   => 'Comment relancer automatiquement un client pour un impayé ?',
                'answer'     => "Dans Facturation → Relances, vous voyez toutes les factures échues. Cliquez sur « Envoyer une relance » pour envoyer un email de rappel personnalisé avec la facture en pièce jointe. Vous pouvez configurer des relances automatiques à J+7, J+15 et J+30 après échéance dans Administration → Paramètres facturation.",
                'keywords'   => 'relance, impayé, retard, email relance, automatique, échéance',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 5,
                'question'   => 'Comment créer un avoir ou annuler une facture ?',
                'answer'     => "Depuis la facture concernée → menu Actions → « Créer un avoir ». Définissez le montant à rembourser (avoir total ou partiel). CONSTRUIRO génère un avoir avec un numéro séquentiel (AV-XXXX) et le relie à la facture d'origine. Une facture validée ne peut jamais être modifiée directement — l'avoir est le mécanisme légal de correction.",
                'keywords'   => 'avoir, annulation, remboursement, correction facture, AV',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 6,
                'question'   => 'Quels formats d\'export sont disponibles pour les factures ?',
                'answer'     => "Chaque facture, devis ou avoir peut être exporté en PDF (mise en page officielle avec logo et tampon), Excel (pour retraitement comptable) ou envoyé directement par email. Le format PDF respecte les normes locales OHADA. Vous pouvez personnaliser le modèle PDF (couleurs, mentions légales) dans Administration → Modèles de documents.",
                'keywords'   => 'export, PDF, Excel, email, format, modèle document, OHADA',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 7,
                'question'   => 'Comment configurer la TVA et les autres taxes ?',
                'answer'     => "Dans Administration → Taxes, créez vos taux de TVA selon votre pays (ex. TVA 18% en Côte d'Ivoire, 19,25% au Cameroun). Vous pouvez avoir plusieurs taux actifs simultanément. Sur chaque ligne de devis/facture, sélectionnez le taux applicable. CONSTRUIRO calcule les totaux HT, TVA et TTC automatiquement.",
                'keywords'   => 'TVA, taxes, taux, OHADA, Côte d\'Ivoire, Cameroun, HT TTC',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 8,
                'question'   => 'Comment facturer des clients dans plusieurs devises ?',
                'answer'     => "CONSTRUIRO supporte le FCFA (XOF), EUR, USD, GNF, MAD et d'autres devises. Pour facturer dans une devise différente de celle de l'organisation, sélectionnez la devise lors de la création du devis/facture. Le taux de change est configurable manuellement dans Administration → Devises, ou mis à jour automatiquement si l'option est activée.",
                'keywords'   => 'devises, multi-devises, FCFA, EUR, USD, taux de change',
            ],
            [
                'category'   => 'facturation',
                'sort_order' => 9,
                'question'   => 'Comment retrouver tout l\'historique de facturation d\'un client ?',
                'answer'     => "Dans le module CRM → Clients, ouvrez la fiche du client → onglet « Facturation ». Vous voyez tous les devis (statuts, montants), toutes les factures (payées, partielles, en retard), tous les avoirs, le total encaissé et le solde outstanding. Vous pouvez exporter l'historique complet en PDF ou Excel.",
                'keywords'   => 'historique factures, client, encaissé, solde, CRM',
            ],

            // ══════════════════════════════════════════════════════════════
            // STOCKS & MATÉRIAUX (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'stocks',
                'sort_order' => 1,
                'question'   => 'Comment ajouter un matériau au catalogue de stocks ?',
                'answer'     => "Menu Stocks → Catalogue → Nouveau matériau. Renseignez : code article, désignation, catégorie (Ciment, Fer, Bois, Électricité...), unité (kg, m³, m², pièce, T), prix d'achat moyen, fournisseur principal. Vous pouvez téléverser une photo et un code-barres. Le matériau devient alors disponible dans tous les modules (commandes, sorties, budget projet).",
                'keywords'   => 'matériau, catalogue, article, code article, créer, stocks',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 2,
                'question'   => 'Comment enregistrer une entrée ou une sortie de stock ?',
                'answer'     => "Dans Stocks → Mouvements → Nouveau mouvement. Choisissez le type : Entrée (livraison fournisseur), Sortie (consommation chantier), Retour, Ajustement. Sélectionnez l'entrepôt, l'article et la quantité. Pour les sorties, liez le mouvement au projet et à la phase concernée. CONSTRUIRO met à jour le stock en temps réel et calcule le coût moyen pondéré.",
                'keywords'   => 'mouvement, entrée, sortie, stock, livraison, consommation, chantier',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 3,
                'question'   => 'Comment réaliser un inventaire physique des stocks ?',
                'answer'     => "Stocks → Inventaire → Nouvel inventaire. Sélectionnez l'entrepôt et démarrez la session d'inventaire. CONSTRUIRO fige les mouvements pendant l'inventaire et génère une liste de comptage (PDF ou sur tablette). Saisissez les quantités comptées. Le système calcule les écarts et génère automatiquement les ajustements de régularisation après validation.",
                'keywords'   => 'inventaire, comptage, ajustement, régularisation, entrepôt',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 4,
                'question'   => 'Comment effectuer un transfert de matériaux entre deux entrepôts ?',
                'answer'     => "Stocks → Transferts → Nouveau transfert. Sélectionnez l'entrepôt source, l'entrepôt destination, les articles et les quantités. Après validation, CONSTRUIRO génère un bon de transfert imprimable. Le stock de la source est débité et celui de la destination crédité instantanément. Vous pouvez aussi planifier un transfert pour une date future.",
                'keywords'   => 'transfert, entrepôt, bon de transfert, site, chantier',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 5,
                'question'   => 'Comment configurer les seuils d\'alerte de stock minimum ?',
                'answer'     => "Sur la fiche de chaque article (Stocks → Catalogue → modifier l'article), définissez le « Stock minimum » et le « Stock de sécurité ». Quand la quantité disponible passe sous ce seuil, une alerte apparaît dans le tableau de bord et une notification est envoyée au Magasinier et au Responsable achats. Vous pouvez aussi configurer une suggestion automatique de réapprovisionnement.",
                'keywords'   => 'seuil alerte, stock minimum, rupture, réapprovisionnement, notification',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 6,
                'question'   => 'Comment générer un rapport de consommation de matériaux par projet ?',
                'answer'     => "Rapports → Stocks → Rapport de consommation. Filtrez par projet, période et/ou catégorie de matériau. Le rapport affiche la quantité consommée, le coût total par poste et la comparaison avec le devis initial. Disponible en PDF et Excel. Ce rapport est aussi accessible directement depuis la fiche projet, onglet « Matériaux ».",
                'keywords'   => 'rapport consommation, matériaux, projet, coût, analyse',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 7,
                'question'   => 'Comment gérer les fournisseurs et leurs prix d\'achat ?',
                'answer'     => "Module Achats → Fournisseurs → Nouveau fournisseur (ou depuis Stocks → Catalogue → onglet Fournisseurs d'un article). Pour chaque article, vous pouvez associer plusieurs fournisseurs avec leur prix d'achat et délai de livraison. Lors d'une commande, CONSTRUIRO propose automatiquement le fournisseur le moins cher ou le plus rapide selon vos préférences.",
                'keywords'   => 'fournisseur, prix achat, catalogue, commande, livraison, moins cher',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 8,
                'question'   => 'Comment importer un stock initial en masse via Excel ?',
                'answer'     => "Stocks → Catalogue → Importer. Téléchargez le modèle Excel fourni, complétez-le avec vos articles (code, désignation, catégorie, quantité initiale, prix achat, entrepôt). Importez le fichier. CONSTRUIRO crée les articles inexistants et génère automatiquement un mouvement d'entrée initial pour les quantités renseignées. L'import est idempotent : les articles déjà existants sont mis à jour.",
                'keywords'   => 'importer stock, Excel, masse, bulk, import initial',
            ],
            [
                'category'   => 'stocks',
                'sort_order' => 9,
                'question'   => 'Comment utiliser les codes-barres pour les mouvements de stock ?',
                'answer'     => "CONSTRUIRO génère un QR code / code-barres pour chaque article. Imprimez les étiquettes depuis Stocks → Catalogue → « Imprimer étiquettes ». Sur mobile (PWA), ouvrez un mouvement et utilisez l'icône de scan pour lire le code-barres avec votre caméra : l'article est automatiquement reconnu et ajouté. Compatible scanners USB Bluetooth également.",
                'keywords'   => 'code-barres, QR code, scan, étiquette, mobile, scanner',
            ],

            // ══════════════════════════════════════════════════════════════
            // RH & PAIE (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'rh',
                'sort_order' => 1,
                'question'   => 'Comment ajouter un nouvel employé dans le système RH ?',
                'answer'     => "Menu RH → Employés → Nouvel employé. Renseignez les informations personnelles (nom, prénom, date de naissance, nationalité, pièce d'identité), le poste, le département, la date d'embauche, le type de contrat (CDI, CDD, temporaire, stagiaire) et le salaire de base. Vous pouvez téléverser la photo et les documents (contrat, diplômes). L'employé est immédiatement disponible pour les pointages et la paie.",
                'keywords'   => 'employé, RH, ajouter, onboarding, contrat, poste',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 2,
                'question'   => 'Comment enregistrer les présences et le pointage des employés ?',
                'answer'     => "RH → Présences → Nouveau pointage (ou via la PWA mobile sur le chantier). Sélectionnez l'employé, la date, le projet et les heures de travail (arrivée/départ ou saisie directe des heures). Le module calcule automatiquement les heures normales, heures supplémentaires et absences. Les responsables de chantier peuvent saisir le pointage de toute leur équipe en une seule opération.",
                'keywords'   => 'présences, pointage, heures, chantier, heures supplémentaires',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 3,
                'question'   => 'Comment calculer et générer les bulletins de paie ?',
                'answer'     => "RH → Paie → Nouvelle fiche de paie → sélectionnez le mois. CONSTRUIRO importe automatiquement les présences du mois, calcule les heures supplémentaires, les retenues (CNPS, IRF selon le barème local), les primes et déductions. Vérifiez le récapitulatif, puis cliquez « Valider et générer ». Les bulletins de paie PDF sont disponibles immédiatement pour impression ou envoi par email.",
                'keywords'   => 'paie, bulletin, salaire, CNPS, IRF, retenues, calcul paie',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 4,
                'question'   => 'Comment gérer les congés et les absences des employés ?',
                'answer'     => "RH → Congés → Nouvelle demande. L'employé (ou son responsable) soumet une demande de congé en précisant le type (congé annuel, congé maladie, congé maternité, absence autorisée...) et les dates. Le responsable reçoit une notification et approuve/refuse depuis son tableau de bord. Le solde de congés est mis à jour automatiquement. Les absences non justifiées sont signalées lors du calcul de paie.",
                'keywords'   => 'congés, absences, demande, validation, solde congés, maladie',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 5,
                'question'   => 'Comment générer des documents RH (attestations, certificats) ?',
                'answer'     => "RH → Employés → fiche de l'employé → onglet « Documents » → « Générer un document ». Choisissez le modèle : Attestation de travail, Attestation de salaire, Lettre de mission, Fiche de poste. CONSTRUIRO pré-remplit le document avec les données de l'employé. Vous pouvez personnaliser les modèles dans Administration → Modèles RH.",
                'keywords'   => 'attestation, certificat, lettre, document RH, modèle',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 6,
                'question'   => 'Comment gérer les contrats de travail dans CONSTRUIRO ?',
                'answer'     => "RH → Contrats → Nouveau contrat. Associez le contrat à un employé, définissez le type (CDI, CDD, intérimaire), les dates de début et fin (pour les CDD), le poste, la rémunération et les clauses spéciales. CONSTRUIRO alerte automatiquement 30 jours avant la fin d'un CDD. Les contrats peuvent être générés en PDF depuis les modèles prédéfinis.",
                'keywords'   => 'contrat, CDI, CDD, renouvellement, alerte expiration',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 7,
                'question'   => 'Comment visualiser l\'organigramme de l\'entreprise ?',
                'answer'     => "RH → Organisation → Organigramme. CONSTRUIRO génère automatiquement l'organigramme à partir des rattachements hiérarchiques définis dans les fiches employés. Vous pouvez naviguer dans la structure, filtrer par département ou par projet. L'organigramme est exportable en PDF ou PNG pour vos présentations.",
                'keywords'   => 'organigramme, hiérarchie, département, structure, organisation',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 8,
                'question'   => 'Comment enregistrer et suivre les formations des employés ?',
                'answer'     => "RH → Formations → Nouvelle formation. Créez la formation (titre, organisme, type : sécurité, technique, management...), les dates et le coût. Affectez les participants. Après la formation, enregistrez le résultat (réussi/échoué) et téléversez les attestations. CONSTRUIRO alerte sur les certifications à renouveler (ex. habilitations électriques, CACES).",
                'keywords'   => 'formation, certifications, habilitation, compétences, recyclage',
            ],
            [
                'category'   => 'rh',
                'sort_order' => 9,
                'question'   => 'Comment générer des certificats de travail lors d\'un départ ?',
                'answer'     => "Lors de la clôture d'un dossier employé (RH → Employés → fiche → « Enregistrer le départ »), CONSTRUIRO génère automatiquement le certificat de travail, le solde de tout compte et le reçu de solde de tout compte. Définissez le motif de départ (démission, fin de contrat, licenciement...). L'employé passe en statut « Inactif » mais ses données restent archivées.",
                'keywords'   => 'certificat travail, départ, solde tout compte, licenciement, fin contrat',
            ],

            // ══════════════════════════════════════════════════════════════
            // SÉCURITÉ & ACCÈS (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'securite',
                'sort_order' => 1,
                'question'   => 'Comment activer l\'authentification à deux facteurs (2FA) ?',
                'answer'     => "Mon profil (avatar en haut à droite) → Sécurité → Authentification à deux facteurs → Activer. Scannez le QR code avec une application d'authentification (Google Authenticator, Authy, Microsoft Authenticator). Entrez le code à 6 chiffres pour confirmer. À la prochaine connexion, vous devrez saisir le code en plus de votre mot de passe. Conservez précieusement les codes de secours générés.",
                'keywords'   => '2FA, double authentification, sécurité, TOTP, Google Authenticator',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 2,
                'question'   => 'Comment changer mon mot de passe depuis mon profil ?',
                'answer'     => "Mon profil → Sécurité → Changer le mot de passe. Entrez votre mot de passe actuel, puis le nouveau mot de passe deux fois. CONSTRUIRO impose un minimum de 8 caractères avec au moins une majuscule et un chiffre. Tous les autres navigateurs où votre session est ouverte seront déconnectés automatiquement après le changement.",
                'keywords'   => 'mot de passe, changer, sécurité, profil, connexion',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 3,
                'question'   => 'Comment voir et gérer mes sessions actives ?',
                'answer'     => "Mon profil → Sécurité → Sessions actives. Vous voyez la liste de tous les appareils connectés à votre compte (navigateur, adresse IP, localisation approximative, date de dernière activité). Vous pouvez révoquer une session suspecte en cliquant sur « Déconnecter cet appareil » ou déconnecter toutes les autres sessions en une seule action.",
                'keywords'   => 'sessions, appareils, connexion, révoquer, sécurité, IP',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 4,
                'question'   => 'Comment configurer les permissions par rôle ?',
                'answer'     => "Administration → Rôles & Permissions. Pour chaque rôle, vous configurez les permissions par module et par action (voir, créer, modifier, supprimer, valider, exporter). Les rôles prédéfinis (Super Admin, Directeur, Comptable, RH, Magasinier, Chef projet, Visiteur) peuvent être clonés et personnalisés. Les modifications de permissions prennent effet immédiatement.",
                'keywords'   => 'rôles, permissions, droits, Super Admin, accès module',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 5,
                'question'   => 'Comment consulter le journal d\'activité des utilisateurs ?',
                'answer'     => "Administration → Journal d'activité. Chaque action importante (connexion, création/modification/suppression de données, export, validation) est enregistrée avec l'utilisateur, la date, l'heure et l'adresse IP. Vous pouvez filtrer par utilisateur, module, type d'action et période. Le journal est exportable en CSV pour audit.",
                'keywords'   => 'journal activité, audit, logs, traçabilité, historique actions',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 6,
                'question'   => 'Comment forcer la déconnexion d\'un utilisateur ?',
                'answer'     => "Administration → Utilisateurs → fiche de l'utilisateur → menu Actions → « Déconnecter toutes les sessions ». Cela invalide immédiatement tous les tokens de l'utilisateur. Utile en cas de perte d'un appareil ou de départ d'un employé. Vous pouvez aussi désactiver un compte en cliquant sur « Désactiver l'accès ».",
                'keywords'   => 'déconnecter, forcer, sessions, désactiver compte, sécurité',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 7,
                'question'   => 'Quelle est la politique de protection des données de CONSTRUIRO ?',
                'answer'     => "CONSTRUIRO est hébergé sur des serveurs sécurisés avec chiffrement des données au repos et en transit (TLS 1.3). Les sauvegardes sont effectuées quotidiennement avec rétention de 30 jours. IBIG SARL ne revend jamais vos données à des tiers. Vous êtes propriétaire de vos données et pouvez les exporter intégralement ou demander leur suppression à tout moment.",
                'keywords'   => 'politique données, protection, hébergement, RGPD, confidentialité',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 8,
                'question'   => 'CONSTRUIRO est-il conforme au RGPD et aux lois africaines sur les données ?',
                'answer'     => "CONSTRUIRO est conçu en conformité avec le RGPD européen et les lois africaines de protection des données (APDP en Côte d'Ivoire, CNDP au Maroc, DPC au Sénégal, etc.). Vous pouvez configurer la durée de rétention des données personnelles, gérer les consentements et générer un registre de traitements depuis Administration → Conformité RGPD.",
                'keywords'   => 'RGPD, conformité, données personnelles, APDP, loi africaine',
            ],
            [
                'category'   => 'securite',
                'sort_order' => 9,
                'question'   => 'Comment les données sont-elles chiffrées dans CONSTRUIRO ?',
                'answer'     => "Toutes les communications entre votre navigateur et nos serveurs sont chiffrées en HTTPS/TLS 1.3. Les données sensibles (mots de passe) sont hachées avec bcrypt. Les sauvegardes sont chiffrées avec AES-256. Les connexions à la base de données sont sécurisées et les requêtes protégées contre les injections SQL grâce au framework Laravel.",
                'keywords'   => 'chiffrement, TLS, HTTPS, bcrypt, AES, sécurité technique',
            ],

            // ══════════════════════════════════════════════════════════════
            // RAPPORTS & ANALYTICS (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'rapports',
                'sort_order' => 1,
                'question'   => 'Quels rapports sont disponibles dans CONSTRUIRO ?',
                'answer'     => "CONSTRUIRO propose plus de 30 rapports prédéfinis classés par module : Rapports projets (avancement, budget, délais), Rapports financiers (CA, encaissements, impayés, trésorerie), Rapports RH (présences, paie, effectifs), Rapports stocks (consommation, inventaire, valorisation), Rapports HSE (incidents, non-conformités). Tous sont accessibles depuis le menu Rapports.",
                'keywords'   => 'rapports disponibles, liste, 30 rapports, modules, types',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 2,
                'question'   => 'Comment personnaliser un rapport existant ?',
                'answer'     => "Ouvrez le rapport souhaité → cliquez sur « Personnaliser ». Vous pouvez sélectionner les colonnes à afficher, modifier l'ordre de tri, appliquer des filtres supplémentaires et choisir le style d'affichage (tableau, carte, graphique). Sauvegardez la personnalisation sous un nom (ex. « Mon rapport projet mensuel ») pour y revenir rapidement.",
                'keywords'   => 'personnaliser rapport, colonnes, filtres, sauvegarder',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 3,
                'question'   => 'Comment exporter un rapport en Excel ou PDF ?',
                'answer'     => "Sur n'importe quel rapport, cliquez sur le bouton « Exporter » (icône téléchargement) et choisissez le format : PDF (mise en page avec logo et en-tête de l'entreprise) ou Excel (données brutes pour retraitement). L'export PDF est généré en arrière-plan pour les rapports volumineux ; une notification vous prévient quand le fichier est prêt.",
                'keywords'   => 'export, PDF, Excel, télécharger, rapport',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 4,
                'question'   => 'Comment filtrer un rapport par période ou par projet ?',
                'answer'     => "En haut de chaque rapport, utilisez les filtres disponibles : sélecteur de période (semaine, mois, trimestre, année, période personnalisée), liste déroulante des projets, filtres par statut ou par catégorie. Les filtres sont combinables. Le rapport se met à jour instantanément. La dernière sélection est mémorisée pour votre prochain accès.",
                'keywords'   => 'filtrer, période, projet, trimestre, date, sélecteur',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 5,
                'question'   => 'Comment configurer mon tableau de bord (dashboard) ?',
                'answer'     => "Le tableau de bord est entièrement personnalisable. Cliquez sur « Modifier le tableau de bord » (icône crayon). Ajoutez/supprimez des widgets (KPI, graphiques, tableaux, alertes). Redimensionnez et repositionnez les widgets par glisser-déposer. Chaque utilisateur a son propre tableau de bord selon ses accès. Les administrateurs peuvent définir un tableau de bord par défaut par rôle.",
                'keywords'   => 'tableau de bord, dashboard, widget, personnaliser, KPI',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 6,
                'question'   => 'Quels KPIs sont disponibles pour piloter une entreprise BTP ?',
                'answer'     => "CONSTRUIRO inclut des KPIs spécifiques BTP : Taux d'avancement moyen des projets, Respect des délais (%), Dépassement budgétaire moyen (%), Taux de rotation des stocks, Chiffre d'affaires par projet/mois, Taux d'absentéisme, Coût main-d'œuvre par m², Taux de fréquence des accidents HSE. Tous les KPIs peuvent être ajoutés au tableau de bord.",
                'keywords'   => 'KPI, indicateurs, BTP, avancement, absentéisme, CA',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 7,
                'question'   => 'Comment planifier l\'envoi automatique d\'un rapport par email ?',
                'answer'     => "Sur un rapport → bouton « Planifier ». Définissez la fréquence (quotidienne, hebdomadaire, mensuelle), le jour et l'heure d'envoi, le format (PDF ou Excel), et les destinataires (utilisateurs CONSTRUIRO ou emails externes). Le rapport est généré et envoyé automatiquement selon le planning. Vous pouvez gérer tous les rapports planifiés dans Rapports → Rapports planifiés.",
                'keywords'   => 'planifier, automatique, email, récurrent, destinataires, rapport programmé',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 8,
                'question'   => 'Comment comparer les performances de deux périodes ?',
                'answer'     => "Dans les rapports financiers et projets, activez le mode « Comparaison ». Sélectionnez la période de base (ex. S1 2025) et la période de comparaison (ex. S1 2026). CONSTRUIRO affiche les deux séries de données côte à côte avec les variations en valeur absolue et en pourcentage, ainsi que des graphiques d'évolution.",
                'keywords'   => 'comparaison, période, évolution, variation, S1 S2, year-over-year',
            ],
            [
                'category'   => 'rapports',
                'sort_order' => 9,
                'question'   => 'Comment créer et personnaliser des graphiques dans CONSTRUIRO ?',
                'answer'     => "Module BI → Graphiques → Nouveau graphique. Sélectionnez la source de données (Projets, Facturation, RH, Stocks...), le type de graphique (barres, lignes, camembert, aire, Gantt), les axes X et Y et les dimensions de regroupement. Personnalisez les couleurs et les libellés. Sauvegardez et épinglez le graphique sur votre tableau de bord.",
                'keywords'   => 'graphique, BI, barres, lignes, camembert, tableau de bord, visualisation',
            ],

            // ══════════════════════════════════════════════════════════════
            // ADMINISTRATION (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'administration',
                'sort_order' => 1,
                'question'   => 'Comment configurer le serveur SMTP pour l\'envoi d\'emails ?',
                'answer'     => "Administration → Paramètres → Emails → Configuration SMTP. Renseignez : serveur SMTP (ex. smtp.gmail.com), port (587/465), identifiant, mot de passe, chiffrement (TLS/SSL) et l'adresse expéditeur. Cliquez sur « Tester la configuration » pour envoyer un email de test. CONSTRUIRO utilise cette config pour toutes les notifications et envois de documents.",
                'keywords'   => 'SMTP, email, configurer, serveur mail, notification',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 2,
                'question'   => 'Comment ajouter de nouveaux utilisateurs et gérer les accès ?',
                'answer'     => "Administration → Utilisateurs → Inviter un utilisateur. Entrez l'email, le prénom, le nom et le rôle. L'utilisateur reçoit un email d'invitation avec un lien pour créer son mot de passe. Vous pouvez à tout moment modifier son rôle, ses modules accessibles, ou désactiver son compte. Le nombre d'utilisateurs est limité selon votre plan (Solo : 2, Starter : 5, Pro : 20, Entreprise : illimité).",
                'keywords'   => 'utilisateurs, inviter, accès, rôle, désactiver, plan',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 3,
                'question'   => 'Comment gérer mon abonnement et les factures CONSTRUIRO ?',
                'answer'     => "Administration → Abonnement. Vous consultez votre plan actuel, la date de renouvellement, les limites d'utilisation et l'historique des factures CONSTRUIRO. Pour upgrader, cliquez sur « Changer de plan ». Le paiement se fait par virement bancaire, Orange Money, MTN Money ou carte bancaire. IBIG SARL émet une facture officielle pour chaque paiement.",
                'keywords'   => 'abonnement, plan, facture CONSTRUIRO, paiement, upgrader, Orange Money',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 4,
                'question'   => 'Comment configurer les sauvegardes automatiques ?',
                'answer'     => "Administration → Sauvegardes. Les sauvegardes sont automatiquement effectuées chaque nuit par IBIG SARL (sans action de votre part). Vous pouvez déclencher une sauvegarde manuelle à tout moment et la télécharger (fichier SQL + fichiers media). Sur le plan Entreprise, les sauvegardes peuvent être synchronisées vers votre propre stockage cloud (S3, FTP).",
                'keywords'   => 'sauvegarde, backup, automatique, télécharger, nuit, S3',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 5,
                'question'   => 'Comment personnaliser le logo et les couleurs de l\'interface ?',
                'answer'     => "Administration → Apparence. Téléversez votre logo (PNG ou SVG, fond transparent, min 200×60 px). Choisissez la couleur principale de votre identité visuelle (code hexadécimal ou sélecteur). CONSTRUIRO adapte automatiquement l'interface, les emails et les documents PDF à vos couleurs. Un aperçu en temps réel est disponible avant de sauvegarder.",
                'keywords'   => 'logo, couleurs, identité visuelle, personnaliser, apparence, branding',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 6,
                'question'   => 'Comment utiliser un domaine personnalisé pour mon espace CONSTRUIRO ?',
                'answer'     => "Administration → Domaine personnalisé. Renseignez votre sous-domaine (ex. erp.monentreprise.com). CONSTRUIRO vous fournit un enregistrement CNAME à ajouter chez votre registrar DNS. Après propagation DNS (quelques minutes à 48h), votre espace est accessible via votre propre domaine avec certificat SSL automatique. Disponible sur les plans Pro et Entreprise.",
                'keywords'   => 'domaine personnalisé, CNAME, DNS, SSL, Pro, sous-domaine',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 7,
                'question'   => 'Comment configurer les préférences système (fuseau horaire, devise) ?',
                'answer'     => "Administration → Paramètres système. Vous configurez : le fuseau horaire (Africa/Abidjan, Africa/Douala, Europe/Paris...), la devise par défaut (FCFA, EUR, USD...), le format de date (JJ/MM/AAAA ou MM/DD/YYYY), le séparateur décimal (point ou virgule), la langue par défaut et les jours ouvrés de la semaine (pour les calculs de délais).",
                'keywords'   => 'fuseau horaire, devise, format date, paramètres système, langue',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 8,
                'question'   => 'Comment connecter des applications tierces via les intégrations ?',
                'answer'     => "Administration → Intégrations. CONSTRUIRO propose des connecteurs natifs pour : WhatsApp Business (notifications clients), Google Drive / OneDrive (synchronisation documents), Sage Comptabilité (export comptable), Orange Money & MTN Money (paiements). Pour les intégrations non listées, utilisez l'API REST de CONSTRUIRO avec une clé API générée dans Administration → API.",
                'keywords'   => 'intégrations, WhatsApp, Google Drive, Sage, API, connecteur',
            ],
            [
                'category'   => 'administration',
                'sort_order' => 9,
                'question'   => 'Comment générer et sécuriser mes clés API CONSTRUIRO ?',
                'answer'     => "Administration → API → Générer une clé. Donnez un nom à la clé (ex. « Intégration Sage »), définissez ses permissions (lecture seule, écriture, modules autorisés) et sa date d'expiration. La clé est affichée une seule fois : copiez-la immédiatement. Vous pouvez révoquer une clé à tout moment. La documentation complète de l'API REST est disponible sur developers.ibigsoft.com.",
                'keywords'   => 'API, clé API, REST, intégration, token, webhook',
            ],

            // ══════════════════════════════════════════════════════════════
            // MODULES MÉTIER (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'modules',
                'sort_order' => 1,
                'question'   => 'Comment activer ou désactiver un module dans mon espace ?',
                'answer'     => "Administration → Modules. Vous voyez la liste de tous les modules disponibles avec leur statut. Cliquez sur le bouton bascule pour activer/désactiver un module. Un module désactivé n'apparaît plus dans la navigation mais ses données sont conservées. Certains modules sont interdépendants (ex. Facturation nécessite CRM). CONSTRUIRO vous avertit des dépendances avant toute désactivation.",
                'keywords'   => 'activer, désactiver module, navigation, dépendances',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 2,
                'question'   => 'Comment les données sont-elles partagées entre les différents modules ?',
                'answer'     => "CONSTRUIRO fonctionne en « single source of truth » : les données sont partagées en temps réel entre tous les modules. Exemple : un projet créé dans le module Projets est automatiquement disponible dans Facturation (pour lier les devis), Stocks (pour les sorties de matériaux), RH (pour les affectations) et Rapports. Aucune double saisie n'est nécessaire.",
                'keywords'   => 'partage données, inter-modules, single source of truth, synchronisation',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 3,
                'question'   => 'Comment utiliser le module Équipements et matériel de chantier ?',
                'answer'     => "Module Équipements. Créez une fiche par engin/équipement (bétonnière, grue, camion, groupe électrogène...) avec numéro de série, date d'achat, valeur, kilométrage/heures. Planifiez les maintenances préventives avec alertes automatiques. Affectez les équipements aux projets et suivez les coûts d'utilisation. Gérez les pannes et interventions avec un historique complet.",
                'keywords'   => 'équipements, engins, maintenance, chantier, grue, bétonnière',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 4,
                'question'   => 'Comment utiliser le module HSE (Hygiène-Sécurité-Environnement) ?',
                'answer'     => "Module HSE → Tableau de bord HSE. Enregistrez les incidents (accidents, presqu'accidents, situations dangereuses), les inspections chantier et les non-conformités. Créez des plans d'action corrective avec responsables et délais. Gérez les équipements de protection individuelle (EPI) par employé. Générez les statistiques réglementaires (taux de fréquence, taux de gravité).",
                'keywords'   => 'HSE, sécurité, incident, accident, EPI, inspection, non-conformité',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 5,
                'question'   => 'Comment utiliser le module Laboratoire (contrôle qualité des matériaux) ?',
                'answer'     => "Module Laboratoire → Essais. Créez des campagnes d'essais (béton, sol, acier...) liées à un projet et une phase. Enregistrez les résultats d'essais avec leur conformité aux normes. Générez les procès-verbaux d'essais PDF. Le module alerte automatiquement quand un résultat est hors norme et bloque l'avancement de la phase concernée si configuré.",
                'keywords'   => 'laboratoire, essais, béton, contrôle qualité, PV essais, normes',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 6,
                'question'   => 'Comment utiliser le module Bureau d\'études et ingénierie ?',
                'answer'     => "Module Bureau d'études → Études. Gérez vos études techniques (métrés, descriptifs, devis estimatifs). Créez des bibliothèques de prix unitaires BTP (main-d'œuvre, matériaux, matériel). Générez automatiquement le Devis Quantitatif Estimatif (DQE) et le Sous-Détail des Prix (SDP). Exportez les résultats directement vers le module Facturation pour créer les devis clients.",
                'keywords'   => 'bureau études, DQE, SDP, métrés, prix unitaires, devis estimatif',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 7,
                'question'   => 'Comment utiliser le module Appels d\'offres ?',
                'answer'     => "Module Appels d'offres → Nouvel AO. Créez une fiche d'appel d'offres avec le donneur d'ordre, les lots, la date limite de remise et les documents requis. Préparez votre dossier de réponse (offre technique et financière). Suivez le statut (En cours / Remis / Gagné / Perdu). Les AO gagnés peuvent être convertis directement en projet CONSTRUIRO.",
                'keywords'   => 'appel d\'offres, AO, offre, lot, remise, gagné, perdu',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 8,
                'question'   => 'Comment utiliser le module CRM pour gérer les clients et prospects ?',
                'answer'     => "Module CRM → Contacts. Créez des fiches clients et prospects avec toutes leurs informations de contact, le secteur d'activité et le responsable commercial. Suivez les opportunités dans un pipeline visuel (Kanban). Enregistrez les interactions (appels, réunions, emails). Liez les devis, projets et factures directement à la fiche client pour un suivi complet.",
                'keywords'   => 'CRM, client, prospect, pipeline, opportunité, commercial',
            ],
            [
                'category'   => 'modules',
                'sort_order' => 9,
                'question'   => 'Comment utiliser le module Contrats (marchés et sous-traitance) ?',
                'answer'     => "Module Contrats → Nouveau contrat. Gérez vos contrats de marché (avec les clients) et vos contrats de sous-traitance (avec les prestataires). Pour chaque contrat : montant initial, avenants successifs, clauses de révision de prix, conditions de règlement. CONSTRUIRO alerte sur les délais contractuels, génère les décomptes mensuels et suit les retenues de garantie.",
                'keywords'   => 'contrats, marchés, sous-traitance, avenant, décompte, retenue garantie',
            ],

            // ══════════════════════════════════════════════════════════════
            // ASSISTANT IA SARA (9 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'sara_ia',
                'sort_order' => 1,
                'question'   => 'Qu\'est-ce que SARA et comment l\'utiliser ?',
                'answer'     => "SARA (Système d'Assistance et de Recherche Automatisée) est l'assistante IA intégrée de CONSTRUIRO. Accessible via l'icône SARA dans la navigation ou en bas de chaque page, elle répond à vos questions sur l'utilisation de CONSTRUIRO, vous aide à rechercher des données dans votre ERP (« Quel est le budget consommé du projet X ? ») et vous guide dans les opérations complexes.",
                'keywords'   => 'SARA, IA, assistant, intelligence artificielle, aide, chatbot',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 2,
                'question'   => 'Comment changer le fournisseur d\'IA utilisé par SARA ?',
                'answer'     => "Administration → Configuration IA → Fournisseur IA. CONSTRUIRO supporte plusieurs fournisseurs : Anthropic Claude (recommandé), OpenAI GPT-4, Google Gemini, Mistral AI. Choisissez votre fournisseur, entrez votre clé API personnelle, sélectionnez le modèle et ajustez le niveau de détail des réponses. Vous pouvez revenir à n'importe quel moment au fournisseur précédent.",
                'keywords'   => 'fournisseur IA, Claude, OpenAI, GPT, Gemini, clé API, SARA',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 3,
                'question'   => 'Comment alimenter la base de connaissances de SARA ?',
                'answer'     => "Administration → Base de connaissances SARA (section SuperAdmin) → Ajouter un document. Importez vos documents internes (procédures, guides techniques, politiques RH, cahiers des charges) en PDF, DOCX ou texte. SARA les indexe automatiquement et peut y faire référence dans ses réponses. Plus votre base est complète, plus SARA est précise sur vos propres procédures.",
                'keywords'   => 'base connaissances, RAG, documents, indexation, procédures, SARA',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 4,
                'question'   => 'Mes données métier sont-elles envoyées au fournisseur d\'IA externe ?',
                'answer'     => "Par défaut, SARA envoie uniquement le contenu de la question et les extraits pertinents de votre base de connaissances au fournisseur IA. Les données confidentielles (données personnelles employés, montants des contrats) ne sont PAS transmises, sauf si vous posez explicitement une question sur ces données et que l'option « Données enrichies » est activée (désactivée par défaut).",
                'keywords'   => 'confidentialité, données IA, envoi, OpenAI, Claude, vie privée, RGPD',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 5,
                'question'   => 'Est-ce que SARA fonctionne sans connexion Internet ?',
                'answer'     => "SARA nécessite une connexion Internet pour contacter le fournisseur IA externe. Cependant, CONSTRUIRO met en cache les 50 dernières réponses fréquentes pour une utilisation hors ligne basique. Sur le plan Entreprise, il est possible de déployer un modèle IA local (Ollama + Llama) pour un fonctionnement 100% hors ligne.",
                'keywords'   => 'hors ligne, offline, connexion, SARA, cache, local, Ollama',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 6,
                'question'   => 'Comment améliorer la qualité des réponses de SARA ?',
                'answer'     => "Plusieurs actions améliorent SARA : (1) Alimentez la base de connaissances avec vos documents internes ; (2) Posez des questions précises avec le contexte (nom du projet, module concerné) ; (3) Utilisez le bouton « Cette réponse n'est pas utile » pour signaler les erreurs — cela entraîne SARA ; (4) Mettez à jour le modèle IA dans Configuration IA.",
                'keywords'   => 'améliorer SARA, qualité réponses, feedback, base connaissances, modèle',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 7,
                'question'   => 'Comment accéder à l\'historique de mes conversations avec SARA ?',
                'answer'     => "Dans l'interface SARA, cliquez sur l'icône « Historique » (horloge). Vous accédez à toutes vos conversations précédentes, classées par date. Vous pouvez reprendre une conversation, la supprimer ou l'exporter en PDF. L'historique est personnel : chaque utilisateur ne voit que ses propres conversations. Les administrateurs peuvent consulter les statistiques d'utilisation globales de SARA.",
                'keywords'   => 'historique, conversations, SARA, reprendre, supprimer',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 8,
                'question'   => 'Quels modèles d\'IA sont disponibles et recommandés pour SARA ?',
                'answer'     => "Modèles testés et recommandés : Anthropic Claude 3.5 Sonnet (meilleur équilibre qualité/coût, recommandé), OpenAI GPT-4o (très performant), Google Gemini 1.5 Pro (bon pour les documents longs), Mistral Large (option économique). Pour les petits usages, Claude 3 Haiku ou GPT-4o-mini sont suffisants. La liste est mise à jour dans Configuration IA.",
                'keywords'   => 'modèles IA, Claude, GPT-4, Gemini, Mistral, recommandé, comparer',
            ],
            [
                'category'   => 'sara_ia',
                'sort_order' => 9,
                'question'   => 'Quel est le coût d\'utilisation de SARA avec un modèle IA externe ?',
                'answer'     => "Le coût dépend du fournisseur et du modèle choisi. Exemple avec Claude 3.5 Sonnet : ~0,003$/question. Pour une utilisation moyenne (50 questions/jour), le coût mensuel est d'environ 5$. CONSTRUIRO affiche votre consommation en tokens dans Administration → Configuration IA → Consommation. Vous maîtrisez entièrement les coûts car vous utilisez votre propre clé API.",
                'keywords'   => 'coût IA, tokens, facture, API, Claude, OpenAI, budget IA',
            ],

            // ══════════════════════════════════════════════════════════════
            // SUPPORT & CONTACT (10 FAQ)
            // ══════════════════════════════════════════════════════════════
            [
                'category'   => 'support',
                'sort_order' => 1,
                'question'   => 'Comment ouvrir un ticket de support technique ?',
                'answer'     => "Dans votre espace CONSTRUIRO, cliquez sur « Support » dans la navigation → « Nouveau ticket ». Décrivez le problème, joignez des captures d'écran si nécessaire, et sélectionnez la priorité (Faible, Normale, Haute, Critique). Vous recevez un accusé de réception par email avec le numéro de ticket. Vous pouvez suivre l'état de votre ticket depuis Support → Mes tickets.",
                'keywords'   => 'ticket, support, problème, ouvrir ticket, signaler bug',
            ],
            [
                'category'   => 'support',
                'sort_order' => 2,
                'question'   => 'Quelles sont les priorités des tickets de support et leur signification ?',
                'answer'     => "4 niveaux de priorité : Critique (production bloquée, perte de données) — traitement en moins de 2h ; Haute (fonctionnalité principale indisponible) — traitement en moins de 4h ; Normale (bug avec contournement possible) — traitement sous 24h ; Faible (question, amélioration souhaitée) — traitement sous 72h ouvrées. Les priorités Critique et Haute sont disponibles sur les plans Pro et Entreprise.",
                'keywords'   => 'priorités, niveaux, critique, haute, normale, faible, SLA',
            ],
            [
                'category'   => 'support',
                'sort_order' => 3,
                'question'   => 'Quels sont les délais de réponse garantis (SLA) ?',
                'answer'     => "Délais selon le plan : Solo/Starter (email uniquement) : 72h ouvrées ; Pro (email + chat) : 4h ouvrées ; Entreprise (email + chat + téléphone) : 1h ouvrées. Le support est disponible du lundi au vendredi de 8h à 18h GMT. Pour les incidents critiques (plan Entreprise), une astreinte téléphonique est disponible le weekend via le numéro d'urgence.",
                'keywords'   => 'SLA, délais réponse, garantis, plan, heures ouvrées',
            ],
            [
                'category'   => 'support',
                'sort_order' => 4,
                'question'   => 'Comment escalader un ticket urgent ou non résolu ?',
                'answer'     => "Sur la page de votre ticket → bouton « Escalader ». Indiquez pourquoi l'escalade est nécessaire. Le ticket est remonté à un ingénieur senior et le délai de traitement est réinitialisé selon la priorité Haute ou Critique. Vous pouvez aussi contacter directement IBIG SARL par WhatsApp (+225 27 22 27 60 14) en mentionnant votre numéro de ticket.",
                'keywords'   => 'escalader, urgent, non résolu, WhatsApp, ingénieur senior',
            ],
            [
                'category'   => 'support',
                'sort_order' => 5,
                'question'   => 'Comment autoriser l\'équipe IBIG Soft à accéder temporairement à mon espace ?',
                'answer'     => "Administration → Support → Accès distant. Cliquez sur « Autoriser IBIG Soft » pour générer un accès temporaire (valable 24h ou 48h selon votre choix). L'équipe support peut alors intervenir directement dans votre espace pour diagnostiquer et résoudre le problème. Vous êtes notifié de chaque action effectuée. Révoquez l'accès à tout moment.",
                'keywords'   => 'accès distant, support, IBIG Soft, accès temporaire, intervention',
            ],
            [
                'category'   => 'support',
                'sort_order' => 6,
                'question'   => 'Où trouver le guide utilisateur complet et la documentation ?',
                'answer'     => "La documentation complète est accessible sur docs.ibigsoft.com. Elle inclut : guides d'utilisation par module, tutoriels vidéo, référence API, FAQ détaillée et notes de version. Depuis CONSTRUIRO, cliquez sur « ? » ou « Aide » dans la navigation pour accéder à la documentation contextuelle (liée au module que vous utilisez).",
                'keywords'   => 'guide, documentation, docs, tutoriels, vidéos, manuel',
            ],
            [
                'category'   => 'support',
                'sort_order' => 7,
                'question'   => 'Comment être informé des nouvelles fonctionnalités et mises à jour ?',
                'answer'     => "CONSTRUIRO publie des notes de version (changelog) à chaque mise à jour, accessibles depuis Administration → Nouveautés ou sur le blog ibigsoft.com. Activez les notifications email dans Mon profil → Notifications → « Nouvelles fonctionnalités ». CONSTRUIRO se met à jour automatiquement sans interruption de service — aucune action de votre part n'est requise.",
                'keywords'   => 'nouveautés, mise à jour, changelog, fonctionnalités, notification',
            ],
            [
                'category'   => 'support',
                'sort_order' => 8,
                'question'   => 'Comment contacter directement IBIG SARL ?',
                'answer'     => "IBIG SARL est joignable via : WhatsApp +225 27 22 27 60 14, Email contact@ibigsoft.com, Téléphone +225 27 22 27 60 14 (lun-ven 8h-18h GMT). Adresse : Cocody Danga, Abidjan, Côte d'Ivoire. Pour une démonstration personnalisée ou un devis, remplissez le formulaire de contact sur ibigsoft.com/contact.",
                'keywords'   => 'contact, WhatsApp, email, téléphone, IBIG SARL, Abidjan',
            ],
            [
                'category'   => 'support',
                'sort_order' => 9,
                'question'   => 'Comment donner un avis ou un retour d\'expérience sur CONSTRUIRO ?',
                'answer'     => "Votre avis compte ! Vous pouvez soumettre un retour depuis Mon profil → Donner un avis, ou via le bouton « Feedback » présent sur chaque page. Pour les suggestions de fonctionnalités, utilisez Support → Idées & Suggestions — les idées les plus votées sont intégrées dans la feuille de route. IBIG SARL publie chaque trimestre un récapitulatif des fonctionnalités ajoutées grâce aux retours clients.",
                'keywords'   => 'avis, feedback, retour expérience, suggestion, fonctionnalité, idée',
            ],
            [
                'category'   => 'support',
                'sort_order' => 10,
                'question'   => 'Comment migrer mes données depuis un autre ERP ou logiciel comptable ?',
                'answer'     => "IBIG SARL propose un service de migration accompagnée. Contactez-nous pour démarrer le processus : nous analysons votre système actuel (Sage, EBP, Batigest, Excel, etc.) et préparons un plan de migration. Pour les migrations standard (clients, projets, employés, stocks), utilisez les imports CSV/Excel de CONSTRUIRO. Pour les migrations complexes (historique comptable, documents), l'équipe IBIG intervient directement.",
                'keywords'   => 'migration, Sage, EBP, Batigest, import, historique, migration accompagnée',
            ],
        ];

        foreach ($faqs as $faq) {
            InternalFaq::updateOrCreate(
                [
                    'category' => $faq['category'],
                    'question' => $faq['question'],
                ],
                [
                    'answer'     => $faq['answer'],
                    'keywords'   => $faq['keywords'],
                    'is_published' => true,
                    'sort_order' => $faq['sort_order'],
                ]
            );
        }

        $total = InternalFaq::count();
        $this->command->info("InternalFaqSeeder : {$total} FAQ internes disponibles.");
    }
}
