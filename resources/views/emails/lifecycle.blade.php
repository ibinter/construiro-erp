@extends('emails.layout')
@section('body')

@php
    $billing = url('/billing');
    $cap     = $vars['capChantiers'] ?? 1;
    $days    = $vars['daysLeft'] ?? null;
    $essai   = $vars['essaiJours'] ?? 30;
    $ret     = $vars['retentionJours'] ?? 90;
    $purge   = $vars['purgeDate'] ?? null;
@endphp

<div class="greeting">Bonjour {{ $userName }},</div>

@if($stage === 'onboarding')
    <p>Bienvenue sur <strong>CONSTRUIRO ERP</strong> ! Votre Essai de {{ $essai }} jours a démarré.
       Voici 3 actions pour bien commencer :</p>
    <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:16px 24px;margin:16px 0;">
        <p style="margin:6px 0;">1&#65039;&#8419; Créez votre premier <strong>chantier</strong></p>
        <p style="margin:6px 0;">2&#65039;&#8419; Ajoutez un <strong>devis</strong> ou une <strong>facture</strong></p>
        <p style="margin:6px 0;">3&#65039;&#8419; Invitez votre <strong>équipe</strong></p>
    </div>
    <div class="cta-block">
        <a href="{{ url('/dashboard') }}" class="cta-btn">Ouvrir mon espace &#8594;</a>
    </div>

@elseif($stage === 'closing')
    <p>Il vous reste <strong>{{ $days }} jours</strong> d'Essai sur <strong>CONSTRUIRO ERP</strong>.
       À la fin de l'essai, votre espace bascule automatiquement en <strong>Découverte</strong> :
       <strong>aucune donnée n'est supprimée</strong>.</p>
    <p style="font-weight:700;color:#0f172a;margin:16px 0 8px;">Ce qui se ferme sans formule payante :</p>
    <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:14px 22px;margin-bottom:16px;">
        <p style="margin:4px 0;color:#475569;">&#10007; Export CSV / Excel / PDF</p>
        <p style="margin:4px 0;color:#475569;">&#10007; Multi-utilisateur et rôles</p>
        <p style="margin:4px 0;color:#475569;">&#10007; API et intégrations</p>
        <p style="margin:4px 0;color:#475569;">&#10007; Assistant IA SARA</p>
    </div>
    <p style="color:#16a34a;font-weight:600;">&#10003; Ce qui reste : toutes vos données, consultables et modifiables (jusqu'à {{ $cap }} chantier).</p>
    <div class="cta-block">
        <a href="{{ $billing }}" class="cta-btn">Voir les formules &#8594;</a>
    </div>

@elseif($stage === 'last_day')
    <p><strong>C'est le dernier jour de votre Essai.</strong> Rassurez-vous : <strong>vos données sont conservées</strong>.
       Demain, votre espace passe simplement en <strong>Découverte</strong> (palier gratuit à vie, {{ $cap }} chantier).</p>
    <p>Pour garder l'export, le multi-utilisateur et l'assistant IA, activez une formule quand vous le souhaitez.</p>
    <div class="cta-block">
        <a href="{{ $billing }}" class="cta-btn">Choisir une formule &#8594;</a>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">Aucune urgence — vos données restent accessibles.</p>
    </div>

@elseif($stage === 'switched')
    <p>Votre essai est terminé et votre espace est désormais sur le palier <strong>Découverte</strong> (gratuit à vie).</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px 22px;margin:16px 0;">
        <p style="margin:4px 0;color:#0c4a6e;">&#10003; Vos données sont <strong>conservées et modifiables</strong></p>
        <p style="margin:4px 0;color:#0c4a6e;">&#10003; Vous gérez jusqu'à <strong>{{ $cap }} chantier</strong></p>
        <p style="margin:4px 0;color:#64748b;">&#8226; L'export, le multi-utilisateur, l'API et SARA sont en pause</p>
        <p style="margin:4px 0;color:#64748b;">&#8226; L'usage au-delà du plafond passe en lecture seule (rien n'est supprimé)</p>
    </div>
    <div class="cta-block">
        <a href="{{ $billing }}" class="cta-btn">Réactiver toutes les fonctions &#8594;</a>
    </div>

@elseif($stage === 'followup')
    <p>Vous utilisez CONSTRUIRO en <strong>Découverte</strong> depuis quelques jours — merci de votre confiance !</p>
    <p>Une question sur les formules, une démonstration, ou besoin d'aide pour un chantier précis ?
       Nous vous proposons un échange de <strong>15 minutes</strong>, sans engagement.</p>
    <div class="cta-block">
        <a href="{{ $billing }}" class="cta-btn">Découvrir les formules &#8594;</a>
        <p style="margin-top:12px;font-size:13px;color:#64748b;">
            Ou écrivez-nous : <a href="mailto:support@ibigsoft.com" style="color:#F58220;">support&#64;ibigsoft.com</a>
        </p>
    </div>

@elseif($stage === 'purge')
    <div class="badge-danger" style="font-size:13px;padding:6px 16px;">&#9888; Action requise avant le {{ $purge }}</div>
    <p style="margin-top:16px;">Votre abonnement a expiré et votre espace est en <strong>lecture seule</strong>.
       Conformément à notre politique de conservation ({{ $ret }} jours), <strong>vos données seront supprimées le {{ $purge }}</strong>.</p>
    <p>Pour tout conserver, réactivez votre abonnement. Vous pouvez aussi demander un export de vos données.</p>
    <div class="cta-block">
        <a href="{{ $billing }}" class="cta-btn">Réactiver mon abonnement &#8594;</a>
        <p style="margin-top:12px;font-size:13px;color:#64748b;">
            Export des données : <a href="mailto:support@ibigsoft.com" style="color:#F58220;">support&#64;ibigsoft.com</a>
        </p>
    </div>
@endif

@endsection
