<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'key'        => 'welcome',
                'subject_fr' => 'Bienvenue sur CONSTRUIRO ERP !',
                'subject_en' => 'Welcome to CONSTRUIRO ERP!',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Bienvenue sur <strong>CONSTRUIRO ERP</strong> — la plateforme de gestion BTP conçue pour l\'Afrique.</p><p>Votre compte pour <strong>{{companyName}}</strong> est désormais actif. Vous pouvez vous connecter et commencer à gérer vos chantiers dès maintenant.</p><p><a href="{{loginUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Accéder à mon espace →</a></p><p>Si vous avez des questions, écrivez-nous à <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a>.</p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Welcome to <strong>CONSTRUIRO ERP</strong> — the construction management platform built for Africa.</p><p>Your account for <strong>{{companyName}}</strong> is now active. You can log in and start managing your projects right away.</p><p><a href="{{loginUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Access my workspace →</a></p><p>If you have any questions, reach us at <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a>.</p>',
                'variables'  => ['userName', 'companyName', 'loginUrl', 'isTrial', 'trialDays', 'trialEndsAt'],
            ],
            [
                'key'        => 'trial_expiring_7',
                'subject_fr' => 'Votre essai CONSTRUIRO expire dans 7 jours',
                'subject_en' => 'Your CONSTRUIRO trial expires in 7 days',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Votre période d\'essai CONSTRUIRO ERP se termine dans <strong>7 jours</strong>, le <strong>{{trialEndsAt}}</strong>.</p><p>Pour conserver l\'accès sans interruption, activez votre abonnement dès maintenant.</p><p><a href="{{billingUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Activer mon abonnement →</a></p><p>Des questions ? Contactez-nous à <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a>.</p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Your CONSTRUIRO ERP trial ends in <strong>7 days</strong>, on <strong>{{trialEndsAt}}</strong>.</p><p>To keep uninterrupted access, activate your subscription now.</p><p><a href="{{billingUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Activate my subscription →</a></p><p>Questions? Contact us at <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a>.</p>',
                'variables'  => ['userName', 'companyName', 'trialEndsAt', 'billingUrl'],
            ],
            [
                'key'        => 'trial_expiring_3',
                'subject_fr' => 'Plus que 3 jours pour votre essai CONSTRUIRO',
                'subject_en' => 'Only 3 days left on your CONSTRUIRO trial',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Votre essai CONSTRUIRO ERP se termine dans <strong>3 jours</strong> (le <strong>{{trialEndsAt}}</strong>). Ne perdez pas l\'accès à vos données !</p><p><a href="{{billingUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Souscrire maintenant →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Your CONSTRUIRO ERP trial ends in <strong>3 days</strong> (on <strong>{{trialEndsAt}}</strong>). Don\'t lose access to your data!</p><p><a href="{{billingUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Subscribe now →</a></p>',
                'variables'  => ['userName', 'companyName', 'trialEndsAt', 'billingUrl'],
            ],
            [
                'key'        => 'trial_expiring_1',
                'subject_fr' => 'Dernier jour — votre essai CONSTRUIRO expire demain',
                'subject_en' => 'Last day — your CONSTRUIRO trial expires tomorrow',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>C\'est le dernier jour de votre essai CONSTRUIRO ERP. Il expire le <strong>{{trialEndsAt}}</strong>.</p><p>Activez votre abonnement maintenant pour continuer sans interruption.</p><p><a href="{{billingUrl}}" style="background:#e53e3e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Activer mon abonnement →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Today is the last day of your CONSTRUIRO ERP trial. It expires on <strong>{{trialEndsAt}}</strong>.</p><p>Activate your subscription now to continue without interruption.</p><p><a href="{{billingUrl}}" style="background:#e53e3e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Activate my subscription →</a></p>',
                'variables'  => ['userName', 'companyName', 'trialEndsAt', 'billingUrl'],
            ],
            [
                'key'        => 'payment_confirmed',
                'subject_fr' => 'Paiement confirmé — CONSTRUIRO ERP',
                'subject_en' => 'Payment confirmed — CONSTRUIRO ERP',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Votre paiement de <strong>{{amount}}</strong> pour l\'abonnement <strong>{{planName}}</strong> a bien été reçu.</p><p>Votre abonnement est actif jusqu\'au <strong>{{endsAt}}</strong>.</p><p>Merci pour votre confiance.</p><p><a href="{{billingUrl}}" style="background:#38a169;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Voir ma facture →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Your payment of <strong>{{amount}}</strong> for the <strong>{{planName}}</strong> subscription has been received.</p><p>Your subscription is active until <strong>{{endsAt}}</strong>.</p><p>Thank you for your trust.</p><p><a href="{{billingUrl}}" style="background:#38a169;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">View my invoice →</a></p>',
                'variables'  => ['userName', 'companyName', 'amount', 'planName', 'endsAt', 'billingUrl'],
            ],
            [
                'key'        => 'account_expired',
                'subject_fr' => 'Votre abonnement CONSTRUIRO a expiré',
                'subject_en' => 'Your CONSTRUIRO subscription has expired',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Votre abonnement CONSTRUIRO ERP pour <strong>{{companyName}}</strong> a expiré le <strong>{{expiredAt}}</strong>.</p><p>Vos données sont conservées en sécurité. Renouvelez votre abonnement pour retrouver l\'accès complet.</p><p><a href="{{billingUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Renouveler mon abonnement →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Your CONSTRUIRO ERP subscription for <strong>{{companyName}}</strong> expired on <strong>{{expiredAt}}</strong>.</p><p>Your data is safely preserved. Renew your subscription to restore full access.</p><p><a href="{{billingUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Renew my subscription →</a></p>',
                'variables'  => ['userName', 'companyName', 'expiredAt', 'billingUrl'],
            ],
            [
                'key'        => 'password_reset',
                'subject_fr' => 'Réinitialisation de votre mot de passe CONSTRUIRO',
                'subject_en' => 'Reset your CONSTRUIRO password',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte CONSTRUIRO ERP.</p><p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans <strong>{{expiresIn}}</strong>.</p><p><a href="{{resetUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Réinitialiser mon mot de passe →</a></p><p>Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email.</p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>We received a password reset request for your CONSTRUIRO ERP account.</p><p>Click the button below to set a new password. This link expires in <strong>{{expiresIn}}</strong>.</p><p><a href="{{resetUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset my password →</a></p><p>If you did not request this, please ignore this email.</p>',
                'variables'  => ['userName', 'resetUrl', 'expiresIn'],
            ],
            [
                'key'        => 'demo_requested',
                'subject_fr' => 'Votre demande de démo CONSTRUIRO a été reçue',
                'subject_en' => 'Your CONSTRUIRO demo request has been received',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Merci pour votre intérêt pour CONSTRUIRO ERP ! Nous avons bien reçu votre demande de démonstration.</p><p>Notre équipe vous contactera dans les <strong>24 heures</strong> pour planifier une session adaptée à vos besoins.</p><p>En attendant, vous pouvez consulter notre centre d\'aide ou nous écrire à <a href="mailto:demo@ibigsoft.com">demo@ibigsoft.com</a>.</p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Thank you for your interest in CONSTRUIRO ERP! We have received your demo request.</p><p>Our team will contact you within <strong>24 hours</strong> to schedule a session tailored to your needs.</p><p>In the meantime, you can visit our help center or email us at <a href="mailto:demo@ibigsoft.com">demo@ibigsoft.com</a>.</p>',
                'variables'  => ['userName', 'companyName', 'phone', 'message'],
            ],
            [
                'key'        => 'custom_offer_sent',
                'subject_fr' => 'Votre offre personnalisée CONSTRUIRO ERP',
                'subject_en' => 'Your custom CONSTRUIRO ERP offer',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Suite à nos échanges, nous avons le plaisir de vous adresser une offre personnalisée pour <strong>{{companyName}}</strong>.</p><p><strong>Plan :</strong> {{planName}}<br><strong>Prix :</strong> {{price}}<br><strong>Validité :</strong> {{validUntil}}</p><p>{{message}}</p><p><a href="{{offerUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Voir mon offre →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Following our discussions, we are pleased to send you a custom offer for <strong>{{companyName}}</strong>.</p><p><strong>Plan:</strong> {{planName}}<br><strong>Price:</strong> {{price}}<br><strong>Valid until:</strong> {{validUntil}}</p><p>{{message}}</p><p><a href="{{offerUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">View my offer →</a></p>',
                'variables'  => ['userName', 'companyName', 'planName', 'price', 'validUntil', 'message', 'offerUrl'],
            ],
            [
                'key'        => 'ticket_created',
                'subject_fr' => 'Ticket support #{{ticketNumber}} créé',
                'subject_en' => 'Support ticket #{{ticketNumber}} created',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Votre ticket de support a bien été enregistré.</p><p><strong>Référence :</strong> #{{ticketNumber}}<br><strong>Sujet :</strong> {{subject}}<br><strong>Priorité :</strong> {{priority}}</p><p>Notre équipe vous répondra dans les meilleurs délais. Vous recevrez une notification par email à chaque mise à jour.</p><p><a href="{{ticketUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Suivre mon ticket →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Your support ticket has been successfully registered.</p><p><strong>Reference:</strong> #{{ticketNumber}}<br><strong>Subject:</strong> {{subject}}<br><strong>Priority:</strong> {{priority}}</p><p>Our team will respond as soon as possible. You will receive an email notification for each update.</p><p><a href="{{ticketUrl}}" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Track my ticket →</a></p>',
                'variables'  => ['userName', 'ticketNumber', 'subject', 'priority', 'ticketUrl'],
            ],
            [
                'key'        => 'ticket_resolved',
                'subject_fr' => 'Ticket #{{ticketNumber}} résolu',
                'subject_en' => 'Ticket #{{ticketNumber}} resolved',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Bonne nouvelle — votre ticket <strong>#{{ticketNumber}}</strong> a été résolu.</p><p><strong>Sujet :</strong> {{subject}}<br><strong>Résolution :</strong> {{resolution}}</p><p>Si le problème persiste ou si vous avez d\'autres questions, vous pouvez rouvrir le ticket ou en créer un nouveau.</p><p><a href="{{ticketUrl}}" style="background:#38a169;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Voir le ticket →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Good news — your ticket <strong>#{{ticketNumber}}</strong> has been resolved.</p><p><strong>Subject:</strong> {{subject}}<br><strong>Resolution:</strong> {{resolution}}</p><p>If the issue persists or you have further questions, you can reopen the ticket or create a new one.</p><p><a href="{{ticketUrl}}" style="background:#38a169;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">View ticket →</a></p>',
                'variables'  => ['userName', 'ticketNumber', 'subject', 'resolution', 'ticketUrl'],
            ],
            [
                'key'        => 'account_suspended',
                'subject_fr' => 'Votre compte CONSTRUIRO a été suspendu',
                'subject_en' => 'Your CONSTRUIRO account has been suspended',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Votre compte CONSTRUIRO ERP pour <strong>{{companyName}}</strong> a été suspendu.</p><p><strong>Motif :</strong> {{reason}}</p><p>Pour régulariser votre situation et réactiver votre accès, contactez-nous :</p><p><a href="mailto:support@ibigsoft.com" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Contacter le support →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>Your CONSTRUIRO ERP account for <strong>{{companyName}}</strong> has been suspended.</p><p><strong>Reason:</strong> {{reason}}</p><p>To resolve your situation and reactivate your access, please contact us:</p><p><a href="mailto:support@ibigsoft.com" style="background:#F58220;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Contact support →</a></p>',
                'variables'  => ['userName', 'companyName', 'reason'],
            ],
            [
                'key'        => 'suspicious_login',
                'subject_fr' => 'Connexion suspecte détectée sur votre compte CONSTRUIRO',
                'subject_en' => 'Suspicious login detected on your CONSTRUIRO account',
                'body_fr'    => '<p>Bonjour <strong>{{userName}}</strong>,</p><p>Nous avons détecté une connexion inhabituelle sur votre compte CONSTRUIRO ERP.</p><p><strong>IP :</strong> {{ip}}<br><strong>Pays :</strong> {{country}}<br><strong>Date :</strong> {{loginAt}}<br><strong>Appareil :</strong> {{device}}</p><p>Si vous êtes à l\'origine de cette connexion, ignorez ce message. Sinon, changez immédiatement votre mot de passe.</p><p><a href="{{resetUrl}}" style="background:#e53e3e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Sécuriser mon compte →</a></p>',
                'body_en'    => '<p>Hello <strong>{{userName}}</strong>,</p><p>We detected an unusual login on your CONSTRUIRO ERP account.</p><p><strong>IP:</strong> {{ip}}<br><strong>Country:</strong> {{country}}<br><strong>Date:</strong> {{loginAt}}<br><strong>Device:</strong> {{device}}</p><p>If this was you, ignore this message. Otherwise, change your password immediately.</p><p><a href="{{resetUrl}}" style="background:#e53e3e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Secure my account →</a></p>',
                'variables'  => ['userName', 'ip', 'country', 'loginAt', 'device', 'resetUrl'],
            ],
        ];

        foreach ($templates as $data) {
            EmailTemplate::updateOrCreate(
                ['key' => $data['key']],
                $data
            );
        }
    }
}
