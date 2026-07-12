@extends('emails.layout')
@section('body')
<div class="greeting">Votre demande de support a été enregistrée</div>
<p>Bonjour {{ $userName }}, votre ticket de support a été créé avec succès.</p>
<div class="info-box">
    <p><span class="info-label">N° ticket :</span> #{{ $ticketNumber }}</p>
    <p><span class="info-label">Objet :</span> {{ $subject }}</p>
    <p><span class="info-label">Priorité :</span> {{ $priority }}</p>
    <p><span class="info-label">Statut :</span> Nouveau</p>
</div>
<p>Notre équipe traitera votre demande dans les meilleurs délais. Vous recevrez une notification à chaque mise à jour.</p>
<div class="cta-block">
    <a href="{{ $ticketUrl }}" class="cta-btn">Suivre mon ticket →</a>
</div>
@endsection
