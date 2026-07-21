@extends('emails.layout')
@section('body')
<div class="badge-success" style="background:#dc2626">⚠ Compte suspendu</div>
<div class="greeting">Bonjour {{ $userName }},</div>
<p>Nous vous informons que votre compte CONSTRUIRO a été <strong>temporairement suspendu</strong>.</p>
<div class="info-box">
    <p><span class="info-label">Raison :</span> {{ $reason }}</p>
    <p><span class="info-label">Date de suspension :</span> {{ $suspendedAt }}</p>
</div>
<p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez régulariser votre situation, contactez notre équipe de support.</p>
<div class="cta-block">
    <a href="{{ $contactUrl }}" class="cta-btn">Contacter le support →</a>
</div>
<p>Vous pouvez également nous écrire à <a href="mailto:support@ibigsoft.com" style="color:#F58220">support@ibigsoft.com</a>.</p>
@endsection
