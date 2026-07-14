<?php

namespace App\Http\Controllers;

use App\Models\Integration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestion des intégrations tierces par entreprise.
 */
class IntegrationController extends Controller
{
    /** Catalogue des intégrations disponibles */
    public const CATALOG = [
        [
            'type'        => 'payment',
            'provider'    => 'orange_money',
            'label'       => 'Orange Money',
            'icon'        => 'smartphone',
            'color'       => 'orange',
            'description' => 'Acceptez les paiements via Orange Money CI, SN, CM…',
            'fields'      => [
                ['key' => 'api_key',   'label' => 'Clé API',        'type' => 'password'],
                ['key' => 'merchant_id', 'label' => 'ID Marchand',   'type' => 'text'],
                ['key' => 'sandbox',   'label' => 'Mode sandbox',    'type' => 'checkbox'],
            ],
        ],
        [
            'type'        => 'payment',
            'provider'    => 'mtn_momo',
            'label'       => 'MTN MoMo',
            'icon'        => 'smartphone',
            'color'       => 'yellow',
            'description' => 'Intégration MTN Mobile Money (API MoMo).',
            'fields'      => [
                ['key' => 'subscription_key', 'label' => 'Subscription Key', 'type' => 'password'],
                ['key' => 'api_user',         'label' => 'API User ID',       'type' => 'text'],
                ['key' => 'api_key',          'label' => 'API Key',           'type' => 'password'],
                ['key' => 'sandbox',          'label' => 'Mode sandbox',      'type' => 'checkbox'],
            ],
        ],
        [
            'type'        => 'payment',
            'provider'    => 'wave',
            'label'       => 'Wave',
            'icon'        => 'zap',
            'color'       => 'blue',
            'description' => 'Paiements Wave (Sénégal, Côte d\'Ivoire).',
            'fields'      => [
                ['key' => 'api_key', 'label' => 'Clé secrète Wave', 'type' => 'password'],
            ],
        ],
        [
            'type'        => 'ai',
            'provider'    => 'groq',
            'label'       => 'Groq AI (SARA)',
            'icon'        => 'brain',
            'color'       => 'purple',
            'description' => 'Assistant IA SARA — modèle Llama ultra-rapide via Groq.',
            'fields'      => [
                ['key' => 'api_key', 'label' => 'Clé API Groq', 'type' => 'password'],
                ['key' => 'model',   'label' => 'Modèle',       'type' => 'text', 'placeholder' => 'llama-3.3-70b-versatile'],
            ],
        ],
        [
            'type'        => 'email',
            'provider'    => 'smtp',
            'label'       => 'Email SMTP',
            'icon'        => 'mail',
            'color'       => 'slate',
            'description' => 'Envoyez les emails depuis votre propre serveur SMTP.',
            'fields'      => [
                ['key' => 'host',     'label' => 'Hôte SMTP',     'type' => 'text'],
                ['key' => 'port',     'label' => 'Port',          'type' => 'text', 'placeholder' => '587'],
                ['key' => 'username', 'label' => 'Identifiant',   'type' => 'text'],
                ['key' => 'password', 'label' => 'Mot de passe',  'type' => 'password'],
                ['key' => 'from_name','label' => 'Nom expéditeur','type' => 'text'],
                ['key' => 'from_email','label' => 'Email expéditeur','type' => 'email'],
            ],
        ],
        [
            'type'        => 'whatsapp',
            'provider'    => 'whatsapp_business',
            'label'       => 'WhatsApp Business API',
            'icon'        => 'message-circle',
            'color'       => 'green',
            'description' => 'Envoyez des devis, factures et alertes par WhatsApp.',
            'fields'      => [
                ['key' => 'phone_id',    'label' => 'Phone Number ID',   'type' => 'text'],
                ['key' => 'token',       'label' => 'Access Token',      'type' => 'password'],
                ['key' => 'verify_token','label' => 'Verify Token',      'type' => 'text'],
            ],
        ],
        [
            'type'        => 'webhook',
            'provider'    => 'outgoing',
            'label'       => 'Webhook sortant',
            'icon'        => 'webhook',
            'color'       => 'indigo',
            'description' => 'Envoyez des événements CONSTRUIRO vers un endpoint externe (ERP parent, BI, Zapier…).',
            'fields'      => [
                ['key' => 'url',    'label' => 'URL du webhook',   'type' => 'url'],
                ['key' => 'secret', 'label' => 'Secret HMAC',      'type' => 'password'],
                ['key' => 'events', 'label' => 'Événements (JSON)','type' => 'text', 'placeholder' => '["invoice.paid","project.created"]'],
            ],
        ],
        [
            'type'        => 'api',
            'provider'    => 'external_api',
            'label'       => 'API tierce (REST)',
            'icon'        => 'plug',
            'color'       => 'teal',
            'description' => 'Connectez CONSTRUIRO à n\'importe quelle API REST externe.',
            'fields'      => [
                ['key' => 'base_url', 'label' => 'URL de base',  'type' => 'url'],
                ['key' => 'api_key',  'label' => 'Clé API',      'type' => 'password'],
                ['key' => 'headers',  'label' => 'En-têtes (JSON)', 'type' => 'text'],
            ],
        ],
    ];

    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id;

        $saved = Integration::where('company_id', $companyId)
            ->get()
            ->keyBy(fn ($i) => $i->type . ':' . $i->provider);

        $catalog = collect(self::CATALOG)->map(function ($item) use ($saved) {
            $key         = $item['type'] . ':' . $item['provider'];
            $integration = $saved->get($key);
            return array_merge($item, [
                'id'             => $integration?->id,
                'is_enabled'     => $integration?->is_enabled ?? false,
                'config'         => $integration ? collect($integration->config ?? [])->map(fn ($v, $k) => str_contains($k, 'key') || str_contains($k, 'password') || str_contains($k, 'token') || str_contains($k, 'secret') ? '••••••••' : $v)->toArray() : [],
                'last_tested_at' => $integration?->last_tested_at?->diffForHumans(),
                'last_test_ok'   => $integration?->last_test_ok,
            ]);
        });

        return Inertia::render('Integrations/Index', [
            'integrations' => $catalog,
        ]);
    }

    public function update(Request $request, string $type, string $provider): RedirectResponse
    {
        $this->authorize('administration.update');

        $request->validate([
            'is_enabled' => 'boolean',
            'config'     => 'nullable|array',
        ]);

        Integration::updateOrCreate(
            [
                'company_id' => $request->user()->company_id,
                'type'       => $type,
                'provider'   => $provider,
            ],
            [
                'is_enabled' => $request->boolean('is_enabled'),
                'config'     => $request->input('config', []),
            ]
        );

        return back()->with('success', "Intégration {$provider} mise à jour.");
    }

    public function test(Request $request, string $type, string $provider): RedirectResponse
    {
        $this->authorize('administration.update');

        $integration = Integration::where('company_id', $request->user()->company_id)
            ->where('type', $type)
            ->where('provider', $provider)
            ->first();

        if (!$integration) {
            return back()->withErrors(['test' => 'Intégration non configurée.']);
        }

        // Simule un test de connexion — une vraie implémentation appellerait l'API
        $ok = match ($provider) {
            'groq'   => $this->testGroq($integration),
            'smtp'   => $this->testSmtp($integration),
            default  => null, // non testable automatiquement
        };

        $integration->update([
            'last_tested_at' => now(),
            'last_test_ok'   => $ok,
        ]);

        if ($ok === null) {
            return back()->with('success', 'Test manuel requis — vérifiez la configuration et sauvegardez.');
        }

        return $ok
            ? back()->with('success', 'Connexion réussie !')
            : back()->withErrors(['test' => 'Connexion échouée. Vérifiez les paramètres.']);
    }

    // ── Helpers tests ────────────────────────────────────────────────────────

    private function testGroq(Integration $integration): bool
    {
        $key = $integration->config['api_key'] ?? null;
        if (!$key || str_starts_with($key, '••')) return false;
        try {
            $response = \Illuminate\Support\Facades\Http::withToken($key)
                ->timeout(5)
                ->get('https://api.groq.com/openai/v1/models');
            return $response->ok();
        } catch (\Throwable) {
            return false;
        }
    }

    private function testSmtp(Integration $integration): bool
    {
        $cfg = $integration->config ?? [];
        if (empty($cfg['host'])) return false;
        try {
            $transport = new \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport(
                $cfg['host'],
                (int) ($cfg['port'] ?? 587)
            );
            $transport->start();
            $transport->stop();
            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
