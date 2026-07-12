@extends('emails.layout')
@section('body')
<div class="badge-success">✓ Ticket résolu</div>
<div class="greeting">Votre demande a été traitée</div>
<p>Bonjour {{ $userName }}, votre ticket #{{ $ticketNumber }} a été résolu.</p>
<div class="info-box">
    <p><span class="info-label">Objet :</span> {{ $subject }}</p>
    <p><span class="info-label">Résolution :</span> {{ $resolution }}</p>
</div>
<div class="cta-block">
    <a href="{{ $ticketUrl }}" class="cta-btn">Consulter la réponse →</a>
</div>
<p>Si votre problème n'est pas résolu, vous pouvez rouvrir le ticket depuis votre espace.</p>
@endsection
