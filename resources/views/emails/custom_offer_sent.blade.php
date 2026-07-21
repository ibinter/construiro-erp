@extends('emails.layout')
@section('body')
<div class="badge-success">✓ Offre personnalisée</div>
<div class="greeting">Bonjour {{ $userName }} !</div>
<p>Nous avons préparé une offre personnalisée pour <strong>{{ $companyName }}</strong>. Découvrez ci-dessous les détails :</p>
<div class="info-box">
    <p><span class="info-label">Offre :</span> {{ $offerDescription }}</p>
    <p><span class="info-label">Valable jusqu'au :</span> {{ $validUntil }}</p>
</div>
<p>Pour en savoir plus ou pour accepter cette offre, contactez notre équipe commerciale.</p>
<div class="cta-block">
    <a href="{{ $contactUrl }}" class="cta-btn">Contacter notre équipe →</a>
</div>
<p>Si vous avez des questions, écrivez-nous à <a href="mailto:commercial@ibigsoft.com" style="color:#F58220">commercial@ibigsoft.com</a>.</p>
@endsection
