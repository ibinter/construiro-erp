<?php

namespace Database\Seeders;

use App\Models\LandingFaq;
use App\Models\LandingTemoignage;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class LandingSeeder extends Seeder
{
    public function run(): void
    {
        // ── FAQs ─────────────────────────────────────────────────────────────
        $faqs = [
            [
                'question_fr' => 'Puis-je utiliser CONSTRUIRO sans connexion Internet ?',
                'question_en' => 'Can I use CONSTRUIRO without an Internet connection?',
                'answer_fr'   => 'CONSTRUIRO est une application web et nécessite une connexion Internet. Une version offline partielle est prévue dans une prochaine mise à jour.',
                'answer_en'   => 'CONSTRUIRO is a web application and requires an Internet connection. A partial offline version is planned in a future update.',
                'sort_order'  => 1,
            ],
            [
                'question_fr' => 'Les données de mon entreprise sont-elles sécurisées ?',
                'question_en' => 'Is my company data secure?',
                'answer_fr'   => "Oui. Chaque entreprise dispose de ses propres données isolées. Personne d'autre ne peut accéder à vos informations.",
                'answer_en'   => "Yes. Each company has its own isolated data. No one else can access your information.",
                'sort_order'  => 2,
            ],
            [
                'question_fr' => 'Puis-je importer mes données existantes ?',
                'question_en' => 'Can I import my existing data?',
                'answer_fr'   => "Oui, CONSTRUIRO supporte l'import via fichiers Excel pour les matériaux, clients, fournisseurs et plan comptable.",
                'answer_en'   => 'Yes, CONSTRUIRO supports import via Excel files for materials, clients, suppliers and chart of accounts.',
                'sort_order'  => 3,
            ],
            [
                'question_fr' => 'Combien de temps dure la mise en place ?',
                'question_en' => 'How long does setup take?',
                'answer_fr'   => "La plupart des entreprises sont opérationnelles en 48 heures. Notre équipe vous accompagne lors de l'onboarding.",
                'answer_en'   => 'Most companies are operational within 48 hours. Our team accompanies you during onboarding.',
                'sort_order'  => 4,
            ],
            [
                'question_fr' => "Y a-t-il un contrat d'engagement ?",
                'question_en' => 'Is there a commitment contract?',
                'answer_fr'   => "Non. L'abonnement mensuel est sans engagement. Vous pouvez annuler à tout moment depuis votre espace.",
                'answer_en'   => 'No. The monthly subscription is commitment-free. You can cancel at any time from your account.',
                'sort_order'  => 5,
            ],
            [
                'question_fr' => 'CONSTRUIRO fonctionne-t-il sur mobile ?',
                'question_en' => 'Does CONSTRUIRO work on mobile?',
                'answer_fr'   => "Oui. CONSTRUIRO est responsive et peut être installé comme une PWA sur votre smartphone ou tablette pour un accès rapide depuis l'écran d'accueil.",
                'answer_en'   => 'Yes. CONSTRUIRO is responsive and can be installed as a PWA on your smartphone or tablet for quick access from the home screen.',
                'sort_order'  => 6,
            ],
        ];

        foreach ($faqs as $faq) {
            LandingFaq::updateOrCreate(['question_fr' => $faq['question_fr']], array_merge($faq, ['is_active' => true]));
        }

        // ── Témoignages ───────────────────────────────────────────────────────
        $temoignages = [
            [
                'initiales' => 'KA',
                'nom'       => 'Koffi A.',
                'poste'     => 'Directeur BTP',
                'ville'     => 'Abidjan',
                'texte_fr'  => "CONSTRUIRO a centralisé tout notre suivi de chantier. Fini les fichiers Excel perdus — on pilote tout depuis un seul écran.",
                'texte_en'  => "CONSTRUIRO centralized all our site tracking. No more lost Excel files — we manage everything from one screen.",
                'rating'    => 5,
                'sort_order' => 1,
            ],
            [
                'initiales' => 'MD',
                'nom'       => 'Mamadou D.',
                'poste'     => 'Chef de Projet',
                'ville'     => 'Dakar',
                'texte_fr'  => "La gestion des équipements et du carburant seule nous a économisé plus de 20% de coûts en moins d'un trimestre.",
                'texte_en'  => "Equipment and fuel management alone saved us more than 20% in costs in less than a quarter.",
                'rating'    => 5,
                'sort_order' => 2,
            ],
            [
                'initiales' => 'AB',
                'nom'       => 'Aminata B.',
                'poste'     => 'Directrice Administrative',
                'ville'     => 'Douala',
                'texte_fr'  => "La comptabilité et la facturation intégrées nous font gagner 2 jours de travail manuel chaque mois.",
                'texte_en'  => "Integrated accounting and invoicing saves us 2 days of manual work each month.",
                'rating'    => 5,
                'sort_order' => 3,
            ],
        ];

        foreach ($temoignages as $item) {
            LandingTemoignage::updateOrCreate(['nom' => $item['nom']], array_merge($item, ['is_active' => true]));
        }

        // ── Settings ──────────────────────────────────────────────────────────
        $settings = [
            // Footer contacts
            ['key' => 'footer_phone',       'value' => '+225 27 22 27 60 14',        'group' => 'footer',   'label' => 'Téléphone footer'],
            ['key' => 'footer_email',       'value' => 'contact@ibigsoft.com',        'group' => 'footer',   'label' => 'Email footer'],
            ['key' => 'footer_whatsapp',    'value' => '+2252722276014',              'group' => 'footer',   'label' => 'WhatsApp (sans espaces)'],
            ['key' => 'footer_address',     'value' => 'Abidjan, Côte d\'Ivoire',    'group' => 'footer',   'label' => 'Adresse'],
            // SARA config
            ['key' => 'sara_model',         'value' => 'llama-3.1-8b-instant',       'group' => 'sara',     'label' => 'Modèle Groq'],
            ['key' => 'sara_temperature',   'value' => '0.65',                        'group' => 'sara',     'label' => 'Température (0.0–1.0)'],
            ['key' => 'sara_max_tokens',    'value' => '600',                         'group' => 'sara',     'label' => 'Max tokens'],
            ['key' => 'sara_enabled',       'value' => '1',                           'group' => 'sara',     'label' => 'SARA activée'],
            ['key' => 'sara_prompt_suffix', 'value' => '',                            'group' => 'sara',     'label' => 'Complément système (optionnel)'],
            // Landing général
            ['key' => 'landing_topbar_msg', 'value' => 'Essai gratuit 14 jours — Sans carte bancaire', 'group' => 'landing', 'label' => 'Message barre supérieure'],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}
