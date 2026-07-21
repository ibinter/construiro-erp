@extends('emails.layout')
@section('body')

{{-- Alert banner --}}
<div style="background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border:2px solid #fca5a5;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
    <div style="font-size:40px;margin-bottom:8px;">&#128274;</div>
    <div style="font-size:20px;font-weight:900;color:#b91c1c;margin-bottom:4px;">Acces expire</div>
    <div style="font-size:14px;color:#7f1d1d;">
        Votre {{ $isTrial ? 'essai' : 'abonnement' }} a expire le <strong>{{ $expiredAt }}</strong>
    </div>
</div>

<div class="greeting">Bonjour {{ $userName }},</div>

<p>
    Votre {{ $isTrial ? 'periode d\'essai' : 'abonnement' }} CONSTRUIRO ERP
    <strong>a expire le {{ $expiredAt }}</strong>.
    Votre acces aux modules de gestion de chantiers, facturation, RH et stock est
    actuellement suspendu.
</p>

{{-- Data safety notice --}}
<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin:20px 0;display:flex;gap:14px;align-items:flex-start;">
    <span style="font-size:22px;flex-shrink:0;">&#128181;</span>
    <div>
        <p style="font-weight:700;color:#92400e;margin-bottom:4px;font-size:14px;">Vos donnees sont en securite</p>
        <p style="font-size:13px;color:#78350f;margin:0;line-height:1.6;">
            Toutes vos donnees (chantiers, clients, factures, personnel) sont conservees
            pendant <strong>30 jours</strong> apres l'expiration. Reactivez maintenant
            pour y acceder immediatement.
        </p>
    </div>
</div>

{{-- What is blocked --}}
<div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:20px 0;">
    <div style="background:#f1f5f9;padding:12px 20px;border-bottom:1px solid #e2e8f0;">
        <span style="font-weight:700;color:#374151;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Fonctionnalites suspendues</span>
    </div>
    @php
    $blocked = [
        ['icon'=>'&#127963;', 'label'=>'Gestion des chantiers et projets'],
        ['icon'=>'&#128196;', 'label'=>'Devis, factures et bons de commande'],
        ['icon'=>'&#128101;', 'label'=>'Suivi RH et pointage du personnel'],
        ['icon'=>'&#128230;', 'label'=>'Gestion des stocks et materiaux'],
        ['icon'=>'&#128200;', 'label'=>'Rapports et tableaux de bord'],
    ];
    @endphp
    @foreach($blocked as $item)
    <div style="display:flex;align-items:center;gap:12px;padding:11px 20px;border-bottom:1px solid #f8fafc;">
        <span style="font-size:18px;">{{ $item['icon'] }}</span>
        <span style="font-size:14px;color:#64748b;text-decoration:line-through;">{{ $item['label'] }}</span>
        <span style="margin-left:auto;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;">Suspendu</span>
    </div>
    @endforeach
</div>

<div class="cta-block">
    <a href="{{ $reactivateUrl }}" class="cta-btn" style="font-size:16px;padding:16px 44px;background:#dc2626;">
        Reactiver mon acces maintenant &#8594;
    </a>
    <p style="margin-top:12px;font-size:12px;color:#94a3b8;">
        Reactiver en moins de 2 minutes &bull; Acces immediat apres paiement
    </p>
</div>

<div class="divider"></div>

{{-- Urgency countdown --}}
<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 20px;margin-bottom:8px;text-align:center;">
    <p style="font-size:13px;color:#b91c1c;font-weight:600;margin:0;">
        &#9888; Au-dela de 30 jours, vos donnees seront supprimees definitivement.
        Ne tardez pas.
    </p>
</div>

<p style="font-size:13px;color:#94a3b8;text-align:center;margin-top:16px;">
    Besoin d'aide pour la reactivation ?
    <a href="mailto:support@ibigsoft.com" style="color:#F58220;font-weight:600;">support@ibigsoft.com</a>
</p>

@endsection
