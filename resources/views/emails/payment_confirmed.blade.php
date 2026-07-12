@extends('emails.layout')
@section('body')
<div class="badge-success">✓ Paiement confirmé</div>
<div class="greeting">Reçu de paiement — {{ $planName }}</div>
<p>Bonjour {{ $userName }}, nous avons bien reçu votre paiement. Votre abonnement est actif.</p>
<div class="info-box">
    <p><span class="info-label">Formule :</span> {{ $planName }}</p>
    <p><span class="info-label">Montant :</span> {{ $amount }} {{ $currency }}</p>
    <p><span class="info-label">Référence :</span> {{ $reference }}</p>
    <p><span class="info-label">Date :</span> {{ $paidAt }}</p>
    <p><span class="info-label">Accès jusqu'au :</span> {{ $accessUntil }}</p>
</div>
<div class="cta-block">
    <a href="{{ $dashboardUrl }}" class="cta-btn">Accéder à mon espace →</a>
</div>
@endsection
