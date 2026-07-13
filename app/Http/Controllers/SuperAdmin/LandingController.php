<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LandingFaq;
use App\Models\LandingTemoignage;
use App\Models\LegalPage;
use App\Models\Setting;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    // ── Page principale ────────────────────────────────────────────────────────

    public function index(): Response
    {
        return Inertia::render('SuperAdmin/Landing', [
            'faqs'         => LandingFaq::orderBy('sort_order')->get(),
            'temoignages'  => LandingTemoignage::orderBy('sort_order')->get(),
            'legalPages'   => LegalPage::select('id', 'slug', 'title_fr', 'is_published')->orderBy('slug')->get(),
            'plans'        => SubscriptionPlan::orderBy('sort_order')->get(['id', 'name', 'slug', 'description', 'price_monthly', 'price_yearly', 'max_users', 'max_projects', 'trial_days', 'is_active', 'sort_order']),
            'settings'     => [
                'footer'  => Setting::group('footer'),
                'sara'    => Setting::group('sara'),
                'landing' => Setting::group('landing'),
            ],
        ]);
    }

    // ── FAQ ────────────────────────────────────────────────────────────────────

    public function faqStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question_fr' => 'required|string|max:500',
            'question_en' => 'nullable|string|max:500',
            'answer_fr'   => 'required|string|max:2000',
            'answer_en'   => 'nullable|string|max:2000',
            'sort_order'  => 'integer|min:0',
            'is_active'   => 'boolean',
        ]);

        LandingFaq::create($data);

        return back()->with('success', 'FAQ créée.');
    }

    public function faqUpdate(Request $request, LandingFaq $faq): RedirectResponse
    {
        $data = $request->validate([
            'question_fr' => 'required|string|max:500',
            'question_en' => 'nullable|string|max:500',
            'answer_fr'   => 'required|string|max:2000',
            'answer_en'   => 'nullable|string|max:2000',
            'sort_order'  => 'integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $faq->update($data);

        return back()->with('success', 'FAQ mise à jour.');
    }

    public function faqDestroy(LandingFaq $faq): RedirectResponse
    {
        $faq->delete();
        return back()->with('success', 'FAQ supprimée.');
    }

    // ── Témoignages ────────────────────────────────────────────────────────────

    public function temoignageStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'initiales'  => 'required|string|max:4',
            'nom'        => 'required|string|max:100',
            'poste'      => 'required|string|max:100',
            'ville'      => 'required|string|max:100',
            'texte_fr'   => 'required|string|max:500',
            'texte_en'   => 'nullable|string|max:500',
            'rating'     => 'integer|min:1|max:5',
            'sort_order' => 'integer|min:0',
            'is_active'  => 'boolean',
        ]);

        LandingTemoignage::create($data);

        return back()->with('success', 'Témoignage ajouté.');
    }

    public function temoignageUpdate(Request $request, LandingTemoignage $temoignage): RedirectResponse
    {
        $data = $request->validate([
            'initiales'  => 'required|string|max:4',
            'nom'        => 'required|string|max:100',
            'poste'      => 'required|string|max:100',
            'ville'      => 'required|string|max:100',
            'texte_fr'   => 'required|string|max:500',
            'texte_en'   => 'nullable|string|max:500',
            'rating'     => 'integer|min:1|max:5',
            'sort_order' => 'integer|min:0',
            'is_active'  => 'boolean',
        ]);

        $temoignage->update($data);

        return back()->with('success', 'Témoignage mis à jour.');
    }

    public function temoignageDestroy(LandingTemoignage $temoignage): RedirectResponse
    {
        $temoignage->delete();
        return back()->with('success', 'Témoignage supprimé.');
    }

    // ── Settings (SARA + Footer + Landing) ────────────────────────────────────

    public function settingsUpdate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings'          => 'required|array',
            'settings.*.key'    => 'required|string|max:100',
            'settings.*.value'  => 'nullable|string|max:2000',
        ]);

        foreach ($data['settings'] as $item) {
            Setting::where('key', $item['key'])->update(['value' => $item['value'] ?? '']);
            \Illuminate\Support\Facades\Cache::forget("setting:{$item['key']}");
        }

        return back()->with('success', 'Paramètres enregistrés.');
    }

    // ── Pages légales (toggle published) ──────────────────────────────────────

    public function legalToggle(LegalPage $legalPage): RedirectResponse
    {
        $legalPage->update(['is_published' => ! $legalPage->is_published]);
        return back()->with('success', 'Statut mis à jour.');
    }

    // ── Plans d'abonnement ────────────────────────────────────────────────────

    public function planUpdate(Request $request, SubscriptionPlan $plan): RedirectResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100',
            'description'   => 'nullable|string|max:500',
            'price_monthly' => 'required|integer|min:0',
            'price_yearly'  => 'required|integer|min:0',
            'max_users'     => 'required|integer|min:1',
            'max_projects'  => 'required|integer|min:1',
            'trial_days'    => 'required|integer|min:0',
            'sort_order'    => 'required|integer|min:0',
        ]);

        $plan->update($data);

        return back()->with('success', "Plan « {$plan->name} » mis à jour.");
    }

    public function planToggle(SubscriptionPlan $plan): RedirectResponse
    {
        $plan->update(['is_active' => ! $plan->is_active]);
        return back()->with('success', 'Statut du plan mis à jour.');
    }
}
