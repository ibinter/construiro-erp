<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Jobs\SendMailJob;
use App\Mail\CustomOfferSentMail;
use App\Models\Company;
use App\Models\CustomOffer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CustomOfferController extends Controller
{
    /** Liste toutes les offres, avec filtres par company et statut. */
    public function index(Request $request): Response
    {
        $query = CustomOffer::with(['company:id,name', 'creator:id,name'])
            ->latest();

        if ($companyId = $request->get('company_id')) {
            $query->where('company_id', $companyId);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $offers = $query->paginate(20)->withQueryString();

        return Inertia::render('SuperAdmin/Offers/Index', [
            'offers' => $offers->through(fn($o) => [
                'id'               => $o->id,
                'company_id'       => $o->company_id,
                'company_name'     => $o->company?->name ?? '—',
                'creator_name'     => $o->creator?->name ?? '—',
                'description'      => $o->description,
                'discount_percent' => $o->discount_percent,
                'valid_until'      => $o->valid_until?->format('d/m/Y'),
                'sent_at'          => $o->sent_at?->format('d/m/Y H:i'),
                'accepted_at'      => $o->accepted_at?->format('d/m/Y H:i'),
                'status'           => $o->status,
                'created_at'       => $o->created_at->format('d/m/Y'),
            ]),
            'companies' => Company::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => $request->only(['company_id', 'status']),
        ]);
    }

    /**
     * Créer une offre, l'envoyer par email aux admins de l'entreprise
     * et passer son statut à "sent".
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id'       => 'required|exists:companies,id',
            'description'      => 'required|string|max:2000',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'valid_until'      => 'nullable|date|after:today',
        ]);

        $offer = CustomOffer::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status'     => 'draft',
        ]);

        $company = $offer->company()->with('users')->first();

        // Envoyer à tous les admins de l'entreprise (role "admin")
        // Fallback : si aucun admin trouvé, envoyer à tous les users
        $admins = $company->users()
            ->whereHas('roles', fn($q) => $q->where('name', 'admin'))
            ->get();

        if ($admins->isEmpty()) {
            $admins = $company->users()->get();
        }

        foreach ($admins as $user) {
            try {
                dispatch(new SendMailJob(
                    $user->email,
                    new CustomOfferSentMail(
                        userName:         $user->name,
                        companyName:      $company->name,
                        offerDescription: $offer->description,
                        validUntil:       $offer->valid_until?->format('d/m/Y') ?? 'Non défini',
                        contactUrl:       url('/billing'),
                    )
                ));
            } catch (\Exception $e) {
                Log::warning("CustomOfferSentMail failed for {$user->email}: " . $e->getMessage());
            }
        }

        $offer->update([
            'sent_at' => now(),
            'status'  => 'sent',
        ]);

        return back()->with('success', "Offre envoyée à {$company->name}.");
    }

    /** Supprimer une offre (uniquement si elle est encore en draft). */
    public function destroy(CustomOffer $offer): RedirectResponse
    {
        if ($offer->status !== 'draft') {
            return back()->with('error', 'Seules les offres en brouillon peuvent être supprimées.');
        }

        $offer->delete();

        return back()->with('success', 'Offre supprimée.');
    }
}
