<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class EmailTemplateController extends Controller
{
    /**
     * Liste tous les templates d'emails.
     */
    public function index(): InertiaResponse
    {
        $templates = EmailTemplate::orderBy('key')->get()->map(fn ($t) => [
            'id'         => $t->id,
            'key'        => $t->key,
            'subject_fr' => $t->subject_fr,
            'subject_en' => $t->subject_en,
            'is_active'  => $t->is_active,
            'variables'  => $t->variables ?? [],
            'updated_at' => $t->updated_at?->format('d/m/Y H:i'),
        ]);

        return Inertia::render('SuperAdmin/EmailTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Formulaire d'édition d'un template.
     */
    public function edit(EmailTemplate $emailTemplate): InertiaResponse
    {
        return Inertia::render('SuperAdmin/EmailTemplates/Edit', [
            'template' => [
                'id'         => $emailTemplate->id,
                'key'        => $emailTemplate->key,
                'subject_fr' => $emailTemplate->subject_fr,
                'subject_en' => $emailTemplate->subject_en,
                'body_fr'    => $emailTemplate->body_fr,
                'body_en'    => $emailTemplate->body_en,
                'variables'  => $emailTemplate->variables ?? [],
                'is_active'  => $emailTemplate->is_active,
            ],
        ]);
    }

    /**
     * Mise à jour d'un template.
     */
    public function update(Request $request, EmailTemplate $emailTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'subject_fr' => ['required', 'string', 'max:255'],
            'subject_en' => ['nullable', 'string', 'max:255'],
            'body_fr'    => ['required', 'string'],
            'body_en'    => ['nullable', 'string'],
            'is_active'  => ['boolean'],
        ]);

        $emailTemplate->update($validated);

        return back()->with('success', 'Template mis à jour avec succès.');
    }

    /**
     * Aperçu du template avec des valeurs de démonstration.
     */
    public function preview(EmailTemplate $emailTemplate): Response
    {
        $demoValues = [
            'userName'      => 'Jean-Baptiste Kouassi',
            'companyName'   => 'BTP Côte d\'Ivoire SARL',
            'loginUrl'      => url('/login'),
            'billingUrl'    => url('/billing'),
            'resetUrl'      => url('/password/reset/demo-token'),
            'offerUrl'      => url('/billing'),
            'ticketUrl'     => url('/support/1'),
            'ticketNumber'  => '00042',
            'subject'       => 'Problème de connexion',
            'priority'      => 'Haute',
            'resolution'    => 'Le problème a été résolu côté serveur.',
            'planName'      => 'CONSTRUIRO PRO',
            'price'         => '150 000 XOF / mois',
            'amount'        => '150 000 XOF',
            'validUntil'    => now()->addDays(30)->format('d/m/Y'),
            'endsAt'        => now()->addYear()->format('d/m/Y'),
            'expiredAt'     => now()->subDay()->format('d/m/Y'),
            'trialEndsAt'   => now()->addDays(7)->format('d/m/Y'),
            'trialDays'     => '14',
            'reason'        => 'Impayé — abonnement expiré.',
            'ip'            => '41.204.190.12',
            'country'       => 'Côte d\'Ivoire',
            'loginAt'       => now()->format('d/m/Y à H:i'),
            'device'        => 'Chrome / Windows 10',
            'phone'         => '+225 07 01 02 03 04',
            'message'       => 'Bonjour, nous souhaiterions découvrir CONSTRUIRO ERP.',
            'expiresIn'     => '60 minutes',
            'isTrial'       => 'true',
        ];

        $locale = request('locale', 'fr');
        $subject = $locale === 'en' ? ($emailTemplate->subject_en ?? $emailTemplate->subject_fr) : $emailTemplate->subject_fr;
        $body    = $locale === 'en' ? ($emailTemplate->body_en    ?? $emailTemplate->body_fr)    : $emailTemplate->body_fr;

        // Remplacement des variables {{varName}} par les valeurs de démo.
        foreach ($demoValues as $var => $value) {
            $body    = str_replace('{{'.$var.'}}', $value, $body);
            $subject = str_replace('{{'.$var.'}}', $value, $subject);
        }

        $html = <<<HTML
<!DOCTYPE html>
<html lang="{$locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aperçu : {$subject}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 20px; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        .header  { background: #1e293b; padding: 24px 32px; }
        .header h1 { color: #F58220; margin: 0; font-size: 20px; }
        .body    { padding: 32px; color: #374151; line-height: 1.6; }
        .subject { background: #f8f9fa; border-left: 4px solid #F58220; padding: 8px 16px; margin-bottom: 24px; font-size: 13px; color: #6b7280; }
        .footer  { background: #f8f9fa; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        a { color: #F58220; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header"><h1>CONSTRUIRO ERP</h1></div>
        <div class="body">
            <div class="subject">Sujet : {$subject}</div>
            {$body}
        </div>
        <div class="footer">© IBIG Soft — CONSTRUIRO ERP | <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a></div>
    </div>
</body>
</html>
HTML;

        return response($html)->header('Content-Type', 'text/html');
    }
}
