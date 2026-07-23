<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AiSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * SuperAdmin — Configuration IA globale de la plateforme.
 *
 * Gère l'enregistrement AiSetting avec company_id = null (config globale),
 * utilisé par SaraGateway pour le chatbot public et comme repli plateforme
 * dans l'assistant interne.
 */
class AiSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = $this->globalSetting();

        return Inertia::render('SuperAdmin/AiSetting/Edit', [
            'setting' => [
                'provider'     => $setting->provider     ?? AiSetting::PROVIDER_GROQ,
                'model'        => $setting->model        ?? 'llama-3.1-8b-instant',
                'sara_enabled' => $setting->sara_enabled ?? true,
                'max_tokens'   => $setting->max_tokens   ?? 1024,
                'temperature'  => $setting->temperature  ?? 0.7,
                'config'       => $this->maskSecrets($setting->config ?? []),
            ],
            'providers' => AiSetting::MODELS,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'provider'     => 'required|in:groq,openai,anthropic,google,mistral,grok',
            'model'        => 'required|string|max:100',
            'sara_enabled' => 'boolean',
            'max_tokens'   => 'integer|min:100|max:8192',
            'temperature'  => 'numeric|min:0|max:2',
            'config'       => 'nullable|array',
        ]);

        $setting = $this->globalSetting();

        // Fusionner les secrets : ne pas écraser si la valeur est '***'
        $newConfig      = $validated['config'] ?? [];
        $existingConfig = $setting->config ?? [];

        foreach ($newConfig as $key => $value) {
            if ($value !== '***') {
                $existingConfig[$key] = $value;
            }
        }

        $setting->fill(array_merge($validated, ['config' => $existingConfig]));
        $setting->company_id = null; // garantit qu'il s'agit d'un enregistrement global
        $setting->save();

        return back()->with('success', 'Configuration IA de la plateforme mise à jour.');
    }

    // ---------- Helpers privés -------------------------------------------------

    /**
     * Récupère (ou instancie) l'enregistrement AiSetting global.
     * Utilise withoutGlobalScopes pour bypasser le CompanyScope du SuperAdmin.
     */
    private function globalSetting(): AiSetting
    {
        return AiSetting::withoutGlobalScopes()
            ->whereNull('company_id')
            ->first()
            ?? new AiSetting([
                'provider'     => AiSetting::PROVIDER_GROQ,
                'model'        => 'llama-3.1-8b-instant',
                'sara_enabled' => true,
                'max_tokens'   => 1024,
                'temperature'  => 0.7,
            ]);
    }

    /** Masque les valeurs sensibles avant de les envoyer au front. */
    private function maskSecrets(array $config): array
    {
        foreach (['api_key', 'secret', 'token'] as $key) {
            if (isset($config[$key]) && ! empty($config[$key])) {
                $config[$key] = '***';
            }
        }

        return $config;
    }
}
