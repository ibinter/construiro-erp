<?php

namespace App\Http\Controllers;

use App\Models\InternalFaq;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AideController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->input('category');
        $search   = $request->input('search');

        $faqs = InternalFaq::where('is_published', true)
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($search, fn ($q) => $q->where(function ($sub) use ($search) {
                $sub->where('question', 'LIKE', "%{$search}%")
                    ->orWhere('answer',    'LIKE', "%{$search}%")
                    ->orWhere('keywords',  'LIKE', "%{$search}%");
            }))
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        $categories = [
            'demarrage'      => 'Démarrage rapide',
            'projets'        => 'Gestion des projets',
            'facturation'    => 'Devis & Facturation',
            'stocks'         => 'Stocks & Matériaux',
            'rh'             => 'RH & Paie',
            'securite'       => 'Sécurité & Accès',
            'rapports'       => 'Rapports & Analytics',
            'administration' => 'Administration',
            'modules'        => 'Modules métier',
            'sara_ia'        => 'Assistant IA SARA',
            'support'        => 'Support & Contact',
        ];

        return Inertia::render('Aide', [
            'faqs'       => $faqs,
            'categories' => $categories,
            'category'   => $category,
            'search'     => $search,
            'totalFaqs'  => InternalFaq::where('is_published', true)->count(),
        ]);
    }
}
