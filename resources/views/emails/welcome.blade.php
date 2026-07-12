@extends('emails.layout')
@section('body')
<div class="badge-success">✓ Bienvenue sur CONSTRUIRO</div>
<div class="greeting">Bienvenue, {{ $userName }} !</div>
<p>Votre {{ $isTrial ? 'essai gratuit' : 'compte' }} CONSTRUIRO est activé. Vous pouvez dès maintenant gérer tous vos chantiers depuis une seule plateforme.</p>
@if($isTrial)
<div class="info-box">
    <p><span class="info-label">Durée de l'essai :</span> {{ $trialDays }} jours</p>
    <p><span class="info-label">Fin d'essai :</span> {{ $trialEndsAt }}</p>
    <p><span class="info-label">Modules inclus :</span> Tous les modules CONSTRUIRO</p>
</div>
@endif
<div class="cta-block">
    <a href="{{ $loginUrl }}" class="cta-btn">Accéder à mon espace →</a>
</div>
<p>Si vous avez des questions, notre équipe est disponible à <a href="mailto:support@ibigsoft.com" style="color:#ea580c">support@ibigsoft.com</a>.</p>
@endsection
