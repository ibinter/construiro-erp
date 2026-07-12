<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationPreference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    public function edit(Request $request): Response
    {
        $prefs = NotificationPreference::getForUser($request->user()->id);

        return Inertia::render('Notifications/Preferences', [
            'preferences' => $prefs,
            'types' => Notification::TYPES,
            'typeLabels' => [
                'invoice_due'    => 'Facture échue',
                'quote_accepted' => 'Devis accepté',
                'qhse_incident'  => 'Incident QHSE',
                'budget_alert'   => 'Alerte budget',
                'info'           => 'Information générale',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences'                => 'required|array',
            'preferences.app'            => 'array',
            'preferences.email'          => 'array',
            'preferences.app.*'          => 'boolean',
            'preferences.email.*'        => 'boolean',
        ]);

        $userId = $request->user()->id;
        $channels = ['app', 'email'];

        foreach ($channels as $channel) {
            foreach (Notification::TYPES as $type) {
                $enabled = $validated['preferences'][$channel][$type] ?? true;

                NotificationPreference::updateOrCreate(
                    ['user_id' => $userId, 'channel' => $channel, 'type' => $type],
                    ['enabled' => $enabled],
                );
            }
        }

        return back()->with('success', 'Préférences de notification enregistrées.');
    }
}
