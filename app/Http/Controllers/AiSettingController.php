<?php

namespace App\Http\Controllers;

use App\Models\AiSetting;
use App\Services\LlmClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Paramétrage IA de l'entreprise (réservé à l'administration).
 * La clé API n'est JAMAIS renvoyée au front : on n'expose que sa présence.
 */
class AiSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $setting = AiSetting::firstOrNew(['company_id' => $request->user()->company_id]);

        return Inertia::render('Admin/AiSettings/Edit', [
            'setting' => [
                'provider'   => $setting->provider ?? 'none',
                'model'      => $setting->model,
                'base_url'   => $setting->base_url,
                'enabled'    => (bool) $setting->enabled,
                'has_key'    => ! empty($setting->api_key),
            ],
            'providers' => collect(AiSetting::PROVIDERS)->map(fn ($p, $key) => [
                'key'          => $key,
                'label'        => $p['label'],
                'default_model'=> $p['model'],
                'base_url'     => $p['base_url'],
                'docs'         => $p['docs'],
            ])->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'provider' => ['required', Rule::in(array_keys(AiSetting::PROVIDERS))],
            'model'    => ['nullable', 'string', 'max:120'],
            'base_url' => ['nullable', 'url', 'max:255'],
            'enabled'  => ['boolean'],
            'api_key'  => ['nullable', 'string', 'max:255'],
        ]);

        $setting = AiSetting::firstOrNew(['company_id' => $request->user()->company_id]);
        $setting->company_id = $request->user()->company_id;
        $setting->provider = $data['provider'];
        $setting->model = $data['model'] ?: null;
        $setting->base_url = $data['base_url'] ?: null;
        $setting->enabled = $data['enabled'] ?? false;

        // La clé n'est mise à jour que si une nouvelle valeur est fournie.
        if (! empty($data['api_key'])) {
            $setting->api_key = $data['api_key'];
        }
        if ($data['provider'] === 'none') {
            $setting->enabled = false;
        }

        $setting->save();

        return redirect()->route('admin.ai.edit')->with('success', 'Paramétrage IA enregistré.');
    }

    /** Teste la connexion au fournisseur configuré avec une question neutre. */
    public function test(Request $request): RedirectResponse
    {
        $setting = AiSetting::firstWhere('company_id', $request->user()->company_id);

        if (! $setting || ! $setting->isOperational()) {
            return back()->with('error', 'Aucun fournisseur IA opérationnel (vérifiez le fournisseur, la clé et l\'activation).');
        }

        try {
            $reply = app(LlmClient::class)->chat(
                $setting,
                'Tu es un assistant de test. Réponds en une phrase courte, en français.',
                'Dis simplement que la connexion fonctionne.'
            );

            return back()->with('success', 'Connexion réussie ✓ — réponse : '.mb_substr($reply, 0, 160));
        } catch (\Throwable $e) {
            return back()->with('error', 'Échec du test : '.mb_substr($e->getMessage(), 0, 200));
        }
    }
}
