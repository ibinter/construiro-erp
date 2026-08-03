import { Head } from '@inertiajs/react';
import { useTrans } from '@/i18n';
import { useState } from 'react';

const TERMS = [
    // A
    { term: 'Appel d\'offres (AO)', en: 'Tender / Request for Proposal', def: 'Procédure par laquelle un maître d\'ouvrage invite des entreprises à soumissionner pour l\'exécution de travaux définis dans un cahier des charges.' },
    { term: 'Avant-métré', en: 'Pre-measurement / Quantity estimate', def: 'Estimation préliminaire des quantités de matériaux et prestations nécessaires à la réalisation d\'un ouvrage, établie avant l\'exécution.' },
    // B
    { term: 'BOQ (Bill of Quantities)', en: 'Bill of Quantities', def: 'Document listant et quantifiant tous les travaux d\'un projet, utilisé comme base pour l\'appel d\'offres et le suivi financier.' },
    { term: 'Bordereau des Prix Unitaires (BPU)', en: 'Unit Price Schedule', def: 'Document contractuel fixant le prix unitaire de chaque prestation ou fourniture. Utilisé pour valoriser les métrés et établir les situations de travaux.' },
    { term: 'Budget prévisionnel', en: 'Budget forecast', def: 'Estimation financière globale du coût d\'un projet de construction, servant de référence pour le suivi et le contrôle des dépenses.' },
    { term: 'BTP', en: 'Construction sector (Civil Engineering & Building)', def: 'Bâtiment et Travaux Publics. Secteur regroupant l\'ensemble des activités liées à la construction de bâtiments et d\'infrastructures.' },
    // C
    { term: 'Cahier des Clauses Administratives Particulières (CCAP)', en: 'Special Administrative Clauses', def: 'Document contractuel définissant les conditions administratives applicables à un marché de travaux (délais, pénalités, réceptions, garanties).' },
    { term: 'Cahier des Clauses Techniques Particulières (CCTP)', en: 'Technical Specification', def: 'Document contractuel décrivant les spécifications techniques des travaux à réaliser : matériaux, méthodes d\'exécution, normes applicables.' },
    { term: 'Cautionnement', en: 'Bond / Surety', def: 'Garantie financière fournie par une entreprise (ou sa banque) au maître d\'ouvrage pour se prémunir contre les défaillances.' },
    { term: 'Chantier', en: 'Construction site / Job site', def: 'Lieu géographique où sont réalisés les travaux. Dans CONSTRUIRO, chaque chantier est un projet avec budget, équipe et planning propres.' },
    { term: 'Conducteur de travaux', en: 'Construction supervisor / Project foreman', def: 'Responsable de la coordination des activités sur le chantier : planning, encadrement des ouvriers, relation avec le maître d\'œuvre.' },
    { term: 'Coût prévisionnel', en: 'Planned cost', def: 'Coût estimé d\'une activité, d\'un lot ou d\'un projet avant réalisation, sert de référence pour mesurer les écarts en cours d\'exécution.' },
    // D
    { term: 'Décompte définitif', en: 'Final account', def: 'Décompte financier établi après achèvement des travaux, récapitulant l\'ensemble des prestations réalisées et fixant le montant total dû à l\'entreprise.' },
    { term: 'Délai d\'exécution', en: 'Execution period', def: 'Durée contractuelle accordée à l\'entreprise pour réaliser les travaux, exprimée en jours calendaires ou ouvrables.' },
    { term: 'Devis estimatif et quantitatif', en: 'Quantity takeoff & cost estimate', def: 'Document présentant la liste des ouvrages à réaliser avec leurs quantités et prix unitaires, permettant d\'évaluer le coût total du projet.' },
    // E
    { term: 'Entrepreneur', en: 'Contractor', def: 'Entreprise qui s\'engage contractuellement à réaliser des travaux pour le compte d\'un maître d\'ouvrage, en échange d\'une rémunération.' },
    // F
    { term: 'Facture de situation', en: 'Progress invoice / Interim payment certificate', def: 'Facture émise périodiquement (mensuelle ou par avancement) reflétant le pourcentage de travaux réalisés. Correspond à une situation de travaux valorisée.' },
    { term: 'Fiche de pointage', en: 'Time sheet / Attendance record', def: 'Document enregistrant la présence et les heures travaillées de chaque ouvrier sur le chantier, utilisé pour la paie et le suivi de la main-d\'œuvre.' },
    // G
    { term: 'Garantie de bonne exécution', en: 'Performance bond', def: 'Garantie financière (généralement 5 à 10 % du marché) engageant l\'entreprise à réaliser les travaux conformément au contrat.' },
    // L
    { term: 'Lot (de travaux)', en: 'Work package / Trade package', def: 'Subdivision d\'un projet regroupant des travaux de même nature (lot gros œuvre, lot électricité, lot plomberie). Peut faire l\'objet d\'un marché séparé.' },
    // M
    { term: 'Maître d\'ouvrage (MOA)', en: 'Client / Project owner', def: 'Entité (personne physique ou morale, public ou privé) pour le compte de laquelle les travaux sont réalisés et qui en assume le financement.' },
    { term: 'Maître d\'œuvre (MOE)', en: 'Project manager / Architect engineer', def: 'Entité technique (architecte, bureau d\'études) chargée par le maître d\'ouvrage de concevoir le projet et d\'en assurer la direction de l\'exécution.' },
    { term: 'Marché de travaux', en: 'Works contract', def: 'Contrat par lequel un maître d\'ouvrage confie à une entreprise la réalisation de travaux contre rémunération, selon des conditions définies (prix, délai, qualité).' },
    { term: 'Métré', en: 'Quantity surveying / Measurement', def: 'Opération de comptage et de mesure des ouvrages à réaliser ou réalisés, servant à établir les quantités nécessaires aux devis et aux situations de travaux.' },
    // O
    { term: 'Ordre de service (OS)', en: 'Site instruction / Work order', def: 'Document officiel émis par le maître d\'œuvre à l\'entrepreneur pour prescrire, modifier ou arrêter l\'exécution de travaux. Date de départ du délai contractuel.' },
    // P
    { term: 'Pénalités de retard', en: 'Liquidated damages', def: 'Indemnités forfaitaires dues par l\'entreprise au maître d\'ouvrage en cas de dépassement du délai contractuel d\'exécution.' },
    { term: 'Planning des travaux', en: 'Construction schedule / Work program', def: 'Document représentant la programmation dans le temps des différentes activités du chantier (Gantt, réseau PERT). Outil clé de pilotage dans CONSTRUIRO.' },
    { term: 'Procès-verbal (PV)', en: 'Minutes / Official report', def: 'Document officiel constatant un fait ou une décision (PV de réunion de chantier, PV de réception). Trace écrite faisant foi en cas de litige.' },
    { term: 'Prorata', en: 'Pro-rata contribution', def: 'Quote-part des frais communs de chantier (installation, nettoyage, sécurité) répartis proportionnellement entre les différents lots ou entreprises.' },
    // R
    { term: 'Réception définitive', en: 'Final acceptance / Definitive handover', def: 'Acte par lequel le maître d\'ouvrage accepte définitivement l\'ouvrage après expiration du délai de garantie (généralement 1 an), libérant l\'entrepreneur de ses obligations.' },
    { term: 'Réception provisoire', en: 'Provisional acceptance / Practical completion', def: 'Acte par lequel le maître d\'ouvrage prend possession de l\'ouvrage à l\'achèvement des travaux, sous réserve des réserves éventuelles à lever.' },
    { term: 'Retenue de garantie', en: 'Retention money', def: 'Pourcentage (généralement 5 %) retenu sur chaque situation de travaux pour garantir la levée des réserves. Libéré à la réception définitive.' },
    // S
    { term: 'Situation de travaux', en: 'Progress claim / Interim valuation', def: 'Décompte périodique (mensuel) des travaux exécutés, servant de base à la facturation. Exprime le pourcentage d\'avancement par poste.' },
    { term: 'Sous-traitant', en: 'Subcontractor', def: 'Entreprise à laquelle l\'entreprise principale confie l\'exécution d\'une partie des travaux sous sa responsabilité, avec l\'accord du maître d\'ouvrage.' },
    // T
    { term: 'Taux d\'avancement', en: 'Progress rate / Completion percentage', def: 'Pourcentage d\'exécution des travaux à une date donnée. Dans CONSTRUIRO, chaque projet et chaque tâche dispose d\'un indicateur d\'avancement en temps réel.' },
    { term: 'TVA (Taxe sur la Valeur Ajoutée)', en: 'VAT (Value Added Tax)', def: 'Impôt indirect sur la consommation. En Côte d\'Ivoire, le taux standard est de 18 %. CONSTRUIRO calcule automatiquement la TVA sur les factures et devis.' },
    // V
    { term: 'Variation de quantités', en: 'Quantity variation / Change order', def: 'Modification des quantités d\'un poste de travaux par rapport aux prévisions initiales, entraînant une révision du montant du marché.' },
    { term: 'Visa', en: 'Visa / Document approval', def: 'Approbation formelle d\'un document (plan, note de calcul, procédure) par le maître d\'œuvre, autorisant son exécution. Ne dégage pas l\'entreprise de sa responsabilité.' },
];

export default function Lexique({ auth }) {
    const { t } = useTrans();
    const [search, setSearch] = useState('');
    const [lang, setLang] = useState('fr');

    const letters = [...new Set(TERMS.map(t => t.term[0].toUpperCase()))].sort();

    const filtered = TERMS.filter(item => {
        const q = search.toLowerCase();
        return (
            item.term.toLowerCase().includes(q) ||
            item.en.toLowerCase().includes(q) ||
            item.def.toLowerCase().includes(q)
        );
    });

    const grouped = letters.reduce((acc, letter) => {
        const items = filtered.filter(i => i.term[0].toUpperCase() === letter);
        if (items.length) acc[letter] = items;
        return acc;
    }, {});

    return (
        <>
            <Head title={t('Lexique BTP — CONSTRUIRO')} />

            {/* Hero */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-5xl mb-4">📖</div>
                    <h1 className="text-4xl font-bold mb-3">{t('Lexique BTP')}</h1>
                    <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                        {t('Glossaire des termes métier du Bâtiment et Travaux Publics utilisés dans CONSTRUIRO ERP. Français · English.')}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10">

                {/* Recherche + langue */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input
                        type="search"
                        placeholder={t('Rechercher un terme…')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex gap-2">
                        {['fr', 'en'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                    lang === l
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Index alphabétique */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {letters.map(letter => (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-800/50 transition"
                        >
                            {letter}
                        </a>
                    ))}
                </div>

                {/* Termes groupés */}
                {Object.keys(grouped).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                        {t('Aucun terme trouvé pour')} « {search} »
                    </p>
                )}

                {Object.entries(grouped).map(([letter, items]) => (
                    <section key={letter} id={`letter-${letter}`} className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white font-bold text-lg">
                                {letter}
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:border-orange-200 dark:hover:border-orange-700 transition"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                {item.term}
                                            </h3>
                                            <p className="text-orange-600 dark:text-orange-400 text-sm italic mt-0.5">
                                                {item.en}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-relaxed">
                                        {lang === 'en' ? item.en + ' — ' : ''}{item.def}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        {t('Ce lexique couvre les termes utilisés dans CONSTRUIRO ERP.')}{' '}
                        <a href="/guide/fr" className="text-orange-600 hover:underline">
                            {t('Télécharger le guide complet →')}
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
