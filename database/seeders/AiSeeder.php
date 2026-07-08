<?php

namespace Database\Seeders;

use App\Models\AiConversation;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Historique de démonstration de l'assistant IA : quelques échanges
 * question / réponse rattachés à l'entreprise de démo et à l'administrateur.
 */
class AiSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'construiro-demo')->first();
        if (! $company) {
            return;
        }

        $user = User::where('company_id', $company->id)
            ->where('email', 'admin@construiro.com')
            ->first();

        $exchanges = [
            [
                'question' => "Quel est l'avancement moyen des chantiers ?",
                'answer'   => "L'entreprise compte plusieurs projets en cours ; l'avancement moyen est calculé automatiquement depuis vos données.",
            ],
            [
                'question' => 'Y a-t-il des factures en retard ?',
                'answer'   => "L'assistant vérifie les factures dont l'échéance est dépassée et qui ne sont pas soldées.",
            ],
        ];

        foreach ($exchanges as $e) {
            AiConversation::create([
                'company_id' => $company->id,
                'user_id'    => $user?->id,
                'question'   => $e['question'],
                'answer'     => $e['answer'],
            ]);
        }
    }
}
