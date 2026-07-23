<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethodConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentConfigController extends Controller
{
    // GET /superadmin/payment-config
    public function index(): \Inertia\Response
    {
        $configs = PaymentMethodConfig::orderBy('sort_order')->get()->map(fn($m) => [
            'id'              => $m->id,
            'type'            => $m->type,
            'name'            => $m->name,
            'is_active'       => $m->is_active,
            'instructions_fr' => $m->instructions_fr,
            'instructions_en' => $m->instructions_en,
            'config'          => $this->maskSecrets($m->config ?? []),
            'min_amount'      => $m->min_amount,
            'max_amount'      => $m->max_amount,
            'sort_order'      => $m->sort_order,
        ]);
        return Inertia::render('SuperAdmin/PaymentConfig/Index', ['configs' => $configs]);
    }

    // PATCH /superadmin/payment-config/{type}/toggle
    public function toggle(Request $request, string $type): \Illuminate\Http\RedirectResponse
    {
        $config = PaymentMethodConfig::where('type', $type)->firstOrFail();
        $config->update(['is_active' => !$config->is_active, 'updated_by' => $request->user()->id]);
        return back()->with('success', $config->name . ' ' . ($config->is_active ? 'activé' : 'désactivé'));
    }

    // PUT /superadmin/payment-config/{type}
    public function update(Request $request, string $type): \Illuminate\Http\RedirectResponse
    {
        $config = PaymentMethodConfig::where('type', $type)->firstOrFail();
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'is_active'       => 'boolean',
            'instructions_fr' => 'nullable|string',
            'instructions_en' => 'nullable|string',
            'min_amount'      => 'nullable|numeric|min:0',
            'max_amount'      => 'nullable|numeric|min:0',
            'sort_order'      => 'integer|min:0',
            'config'          => 'nullable|array',
        ]);
        // Fusionner le config (ne pas écraser les secrets par des masques)
        $newConfig = $validated['config'] ?? [];
        $existingConfig = $config->config ?? [];
        foreach ($newConfig as $k => $v) {
            if ($v !== '***') { $existingConfig[$k] = $v; } // garder ancien si masqué
        }
        $config->update(array_merge($validated, ['config' => $existingConfig, 'updated_by' => $request->user()->id]));
        return back()->with('success', 'Configuration mise à jour.');
    }

    private function maskSecrets(array $config): array
    {
        $secrets = ['api_key', 'secret', 'password', 'token', 'private_key', 'webhook_secret', 'cinetpay_api_key', 'cinetpay_secret', 'stripe_secret', 'moneroo_secret'];
        foreach ($secrets as $s) {
            if (isset($config[$s])) { $config[$s] = '***'; }
        }
        return $config;
    }
}
