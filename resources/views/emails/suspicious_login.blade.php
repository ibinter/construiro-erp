@extends('emails.layout')
@section('body')
<div class="badge-danger">⚠ Alerte sécurité</div>
<div class="greeting">Nouvelle connexion détectée</div>
<p>Bonjour {{ $userName }}, une connexion à votre compte CONSTRUIRO a été détectée depuis un nouvel appareil ou une nouvelle localisation.</p>
<div class="info-box">
    <p><span class="info-label">Date :</span> {{ $loginAt }}</p>
    <p><span class="info-label">Adresse IP :</span> {{ $ipAddress }}</p>
    <p><span class="info-label">Appareil :</span> {{ $device }}</p>
    <p><span class="info-label">Localisation :</span> {{ $location }}</p>
</div>
<p><strong>Si vous êtes à l'origine de cette connexion</strong>, vous pouvez ignorer cet email.</p>
<p><strong>Si vous ne reconnaissez pas cette connexion</strong>, sécurisez immédiatement votre compte.</p>
<div class="cta-block">
    <a href="{{ $securityUrl }}" class="cta-btn">Sécuriser mon compte →</a>
</div>
@endsection
