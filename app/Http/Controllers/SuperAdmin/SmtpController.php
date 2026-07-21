<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SmtpSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SmtpController extends Controller
{
    public function show(): Response
    {
        $settings = SmtpSetting::first() ?? new SmtpSetting([
            'host'         => 'smtp.mailgun.org',
            'port'         => 587,
            'encryption'   => 'tls',
            'from_address' => 'noreply@construiro.com',
            'from_name'    => 'CONSTRUIRO ERP',
            'is_active'    => false,
        ]);

        return Inertia::render('SuperAdmin/Smtp', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'host'         => 'required|string|max:255',
            'port'         => 'required|integer|in:25,465,587,2525',
            'username'     => 'nullable|string|max:255',
            'password'     => 'nullable|string|max:255',
            'encryption'   => 'required|in:tls,ssl,null',
            'from_address' => 'required|email',
            'from_name'    => 'required|string|max:100',
        ]);

        SmtpSetting::updateOrCreate(
            ['id' => 1],
            array_merge($validated, ['is_active' => true])
        );

        // Mettre à jour la config Laravel en runtime pour les emails suivants
        config([
            'mail.mailers.smtp.host'       => $validated['host'],
            'mail.mailers.smtp.port'       => $validated['port'],
            'mail.mailers.smtp.username'   => $validated['username'],
            'mail.mailers.smtp.password'   => $validated['password'],
            'mail.mailers.smtp.encryption' => $validated['encryption'] === 'null' ? null : $validated['encryption'],
            'mail.from.address'            => $validated['from_address'],
            'mail.from.name'               => $validated['from_name'],
        ]);

        return back()->with('success', 'Configuration SMTP sauvegardée.');
    }

    public function test(Request $request): RedirectResponse
    {
        $request->validate(['test_email' => 'required|email']);

        try {
            Mail::raw(
                'Test SMTP depuis CONSTRUIRO ERP — configuration opérationnelle.',
                function ($msg) use ($request) {
                    $msg->to($request->test_email)->subject('Test SMTP CONSTRUIRO');
                }
            );

            return back()->with('success', "Email de test envoyé à {$request->test_email}.");
        } catch (\Exception $e) {
            return back()->with('error', 'Échec du test SMTP : ' . $e->getMessage());
        }
    }
}
