<?php

namespace App\Http\Middleware;

use App\Models\PaymentOrder;
use App\Models\Subscription;
use App\Models\SupportSession;
use App\Support\Navigation;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $locale = $user?->locale ?? app()->getLocale();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'job_title' => $user->job_title,
                    'locale'      => $user->locale,
                    'preferences' => $user->preferences ?? (object)[],
                    'company'     => $user->company ? array_merge(
                        $user->company->only(['id', 'name', 'base_currency']),
                        ['is_demo' => (bool) $user->company->is_demo]
                    ) : null,
                    'roles'       => $user->getRoleNames(),
                ] : null,
                'portal'     => $user ? Navigation::portal($user, $locale) : null,
                'navigation' => $user ? Navigation::for($user, $locale) : [],
            ],
            'locale' => $locale,
            // Dictionnaire de traduction de la langue courante (FR = identité).
            'translations' => $this->translations($locale),
            // Messages flash (notifications toast côté client).
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            // Session de support active (avertissement visible dans l'interface)
            'support_session' => fn() => $user && $user->hasRole('ibig_superadmin')
                ? SupportSession::where('support_user_id', $user->id)
                    ->whereNull('ended_at')
                    ->where('expires_at', '>', now())
                    ->with('company:id,name')
                    ->first()?->only(['id', 'reason', 'expires_at', 'company'])
                : null,
            // Badge SuperAdmin : nombre d'ordres de paiement en attente de validation.
            'pendingPaymentOrders' => fn () => $user?->hasRole('ibig_superadmin')
                ? PaymentOrder::where('status', 'pending')->count()
                : null,
            // Modules accessibles selon le plan d'abonnement actif.
            // null = tous les modules inclus. array = slugs autorisés.
            'subscription_modules' => fn () => $user?->company_id
                ? Subscription::where('company_id', $user->company_id)
                    ->whereIn('status', ['active', 'trial'])
                    ->latest()
                    ->first()
                    ?->plan
                    ?->modules
                : null,
        ];
    }

    /**
     * Dictionnaire de traduction pour la langue donnée (fichier lang/{locale}.json).
     * Le français est la langue source : dictionnaire vide (identité).
     */
    protected function translations(string $locale): array
    {
        if ($locale === 'fr') {
            return [];
        }

        $path = lang_path("{$locale}.json");

        return is_file($path)
            ? (json_decode((string) file_get_contents($path), true) ?: [])
            : [];
    }
}
