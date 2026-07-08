<?php

namespace App\Http\Middleware;

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
                    'locale'    => $user->locale,
                    'company'   => $user->company?->only(['id', 'name', 'base_currency']),
                    'roles'     => $user->getRoleNames(),
                ] : null,
                'portal'     => $user ? Navigation::portal($user, $locale) : null,
                'navigation' => $user ? Navigation::for($user, $locale) : [],
            ],
            'locale' => $locale,
        ];
    }
}
