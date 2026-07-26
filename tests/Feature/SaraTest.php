<?php

namespace Tests\Feature;

use App\Models\KnowledgeBase;
use App\Services\SaraGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * §37 — Tests SARA (assistant IA)
 *
 * 1. L'endpoint /api/sara/chat répond 200 avec une clé `reply` (gateway mockée)
 * 2. SARA est accessible sans authentification (route publique par conception)
 * 3. La recherche RAG (KnowledgeBase::search) retourne des résultats cohérents
 */
class SaraTest extends TestCase
{
    use RefreshDatabase;

    // ─── Test 1 : Endpoint SARA répond 200 ───────────────────────────────────

    /**
     * Lorsque SARA est activée et que la gateway retourne une réponse,
     * l'endpoint renvoie un JSON { reply: "..." } avec status 200.
     */
    public function test_sara_chat_endpoint_returns_response(): void
    {
        $this->mock(SaraGateway::class, function ($mock) {
            $mock->shouldReceive('isEnabled')->andReturn(true);
            $mock->shouldReceive('chat')->andReturn('Bonjour ! Je suis SARA, comment puis-je vous aider ?');
        });

        $response = $this->postJson('/api/sara/chat', [
            'message' => 'Bonjour SARA, présentez-vous.',
            'history' => [],
        ]);

        $response->assertOk()
                 ->assertJsonStructure(['reply'])
                 ->assertJsonPath('reply', 'Bonjour ! Je suis SARA, comment puis-je vous aider ?');
    }

    // ─── Test 2 : SARA accessible sans authentification ──────────────────────

    /**
     * La route /api/sara/chat est publique (pas d'auth middleware).
     * Un visiteur non connecté doit obtenir une réponse 200, pas un 401/302.
     *
     * Note : SARA est intentionnellement publique pour la landing page
     * (cf. routes/api.php : "pas d'auth requise, rate-limited").
     */
    public function test_sara_is_accessible_without_authentication(): void
    {
        // Gateway désactivée → retourne le message de fallback sans appel IA réel
        $this->mock(SaraGateway::class, function ($mock) {
            $mock->shouldReceive('isEnabled')->andReturn(false);
        });

        $response = $this->postJson('/api/sara/chat', ['message' => 'Test sans auth']);

        // 200 (pas 401 / 302 / 419) — la route est délibérément publique
        $response->assertOk()->assertJsonStructure(['reply']);
    }

    // ─── Test 3 : Recherche RAG retourne des résultats ───────────────────────

    /**
     * KnowledgeBase::search() doit retourner les entrées correspondantes.
     * En SQLite (tests), la recherche bascule sur LIKE après l'échec FULLTEXT.
     */
    public function test_knowledge_base_search_returns_results(): void
    {
        // Créer une entrée dans la base de connaissances
        KnowledgeBase::create([
            'category'   => 'modules',
            'title_fr'   => 'Module Gestion de Projets',
            'content_fr' => 'CONSTRUIRO permet de planifier les chantiers, suivre les jalons et gérer le budget.',
            'is_active'  => true,
            'priority'   => 10,
        ]);

        KnowledgeBase::create([
            'category'   => 'pricing',
            'title_fr'   => 'Tarification CONSTRUIRO',
            'content_fr' => 'Les tarifs sont disponibles en FCFA, payables mensuellement ou annuellement.',
            'is_active'  => true,
            'priority'   => 5,
        ]);

        // Entrée inactive — ne doit pas apparaître dans les résultats
        KnowledgeBase::create([
            'category'   => 'general',
            'title_fr'   => 'Article inactif',
            'content_fr' => 'Cet article ne doit pas apparaître dans les recherches.',
            'is_active'  => false,
            'priority'   => 0,
        ]);

        // Recherche sur un mot-clé présent dans le contenu
        $results = KnowledgeBase::search('chantier planification', limit: 5);

        $this->assertNotEmpty($results, 'La recherche doit retourner au moins un résultat.');
        $this->assertGreaterThanOrEqual(1, $results->count());

        // Vérifie que l'article inactif est exclu
        $titres = $results->pluck('title_fr')->toArray();
        $this->assertNotContains('Article inactif', $titres);
    }
}
