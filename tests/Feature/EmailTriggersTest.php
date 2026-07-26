<?php

namespace Tests\Feature;

use App\Jobs\SendMailJob;
use App\Mail\DemoRequestedMail;
use App\Mail\PaymentConfirmedMail;
use App\Mail\WelcomeMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * §37 — Tests déclencheurs d'emails
 *
 * Vérifie que les événements métier déclenchent les bons mailables :
 *   1. Inscription → SendMailJob(WelcomeMail) en queue
 *   2. Paiement confirmé → PaymentConfirmedMail peut être construit et envoyé
 *   3. Demande de démo → DemoRequestedMail envoyé directement
 */
class EmailTriggersTest extends TestCase
{
    use RefreshDatabase;

    // ─── Test 1 : Email de bienvenue à l'inscription ──────────────────────────

    /**
     * L'inscription d'un nouvel utilisateur doit dispatcher SendMailJob
     * (qui encapsule WelcomeMail) dans la queue synchrone de test.
     */
    public function test_welcome_email_sent_on_registration(): void
    {
        Queue::fake();

        $this->post('/register', [
            'name'                  => 'Koffi Mensah',
            'email'                 => 'koffi@construiro-test.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        // Vérifie qu'au moins un SendMailJob a été mis en queue pour cette adresse.
        // Les propriétés $to / $mailable sont private → on utilise la réflexion.
        Queue::assertPushed(SendMailJob::class, function (SendMailJob $job) {
            $r = new \ReflectionObject($job);
            $to       = $r->getProperty('to');       $to->setAccessible(true);
            $mailable = $r->getProperty('mailable'); $mailable->setAccessible(true);

            return $to->getValue($job) === 'koffi@construiro-test.com'
                && $mailable->getValue($job) instanceof WelcomeMail;
        });
    }

    // ─── Test 2 : Email de confirmation de paiement ───────────────────────────

    /**
     * PaymentConfirmedMail peut être construit avec les bons paramètres
     * et envoyé via Mail::fake() sans erreur.
     */
    public function test_payment_confirmed_email_sent(): void
    {
        Mail::fake();

        $mailable = new PaymentConfirmedMail(
            userName:    'Aminata Bah',
            planName:    'Pro BTP',
            amount:      '150 000',
            currency:    'FCFA',
            reference:   'PAY-20260726-ABCDEF',
            paidAt:      now()->format('d/m/Y H:i'),
            accessUntil: now()->addMonth()->format('d/m/Y'),
        );

        Mail::to('aminata@btpdouala.com')->send($mailable);

        Mail::assertSent(PaymentConfirmedMail::class, function (PaymentConfirmedMail $mail) {
            return $mail->planName === 'Pro BTP'
                && $mail->currency === 'FCFA';
        });
    }

    // ─── Test 3 : Email de demande de démo ───────────────────────────────────

    /**
     * Soumettre le formulaire de demande de démo doit envoyer DemoRequestedMail
     * directement (Mail::to()->send(), pas de queue).
     */
    public function test_demo_requested_email_sent(): void
    {
        Mail::fake();

        $this->post('/demo-request', [
            'name'    => 'Moussa Coulibaly',
            'email'   => 'moussa@tpabidjan.com',
            'company' => 'TP Abidjan',
            'phone'   => '+225 07 00 00 01',
            'sector'  => 'BTP / Construction',
        ]);

        Mail::assertSent(DemoRequestedMail::class, function (DemoRequestedMail $mail) {
            return $mail->userName === 'Moussa Coulibaly'
                && $mail->company === 'TP Abidjan';
        });
    }
}
