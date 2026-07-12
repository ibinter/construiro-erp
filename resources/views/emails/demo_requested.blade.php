@extends('emails.layout')
@section('body')
<div class="badge-success">✓ Demande reçue</div>
<div class="greeting">Votre demande de démonstration a été enregistrée</div>
<p>Bonjour {{ $userName }}, merci de votre intérêt pour CONSTRUIRO !</p>
<p>Notre équipe commerciale vous contactera dans les <strong>24 heures ouvrées</strong> pour planifier votre démonstration personnalisée.</p>
<div class="info-box">
    <p><span class="info-label">Nom :</span> {{ $userName }}</p>
    <p><span class="info-label">Entreprise :</span> {{ $company }}</p>
    <p><span class="info-label">Secteur :</span> {{ $sector }}</p>
</div>
<p>En attendant, vous pouvez déjà explorer nos fonctionnalités sur notre site.</p>
<div class="cta-block">
    <a href="{{ url('/') }}" class="cta-btn">Découvrir CONSTRUIRO →</a>
</div>
@endsection
