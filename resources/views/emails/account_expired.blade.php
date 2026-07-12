@extends('emails.layout')
@section('body')
<div class="badge-danger">⚠ Accès expiré</div>
<div class="greeting">Votre {{ $isTrial ? 'essai' : 'abonnement' }} a expiré</div>
<p>Bonjour {{ $userName }}, votre accès CONSTRUIRO a expiré le <strong>{{ $expiredAt }}</strong>.</p>
<p>Pour récupérer l'accès à vos données et continuer à gérer vos chantiers, réactivez votre abonnement dès maintenant.</p>
<div class="cta-block">
    <a href="{{ $reactivateUrl }}" class="cta-btn">Réactiver mon accès →</a>
</div>
<p>Vos données sont conservées et seront accessibles dès la réactivation.</p>
@endsection
