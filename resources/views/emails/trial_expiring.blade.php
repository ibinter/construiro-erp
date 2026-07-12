@extends('emails.layout')
@section('body')
<div class="badge-warning">⏳ {{ $daysLeft }} jour(s) restant(s)</div>
<div class="greeting">Votre {{ $isTrial ? 'essai' : 'abonnement' }} arrive à échéance</div>
<p>Bonjour {{ $userName }}, votre {{ $isTrial ? 'période d\'essai' : 'abonnement' }} CONSTRUIRO se termine dans <strong>{{ $daysLeft }} jour(s)</strong>, le <strong>{{ $expiresAt }}</strong>.</p>
<p>Pour continuer à bénéficier de tous les modules sans interruption, activez ou renouvelez votre accès dès maintenant.</p>
<div class="cta-block">
    <a href="{{ $renewUrl }}" class="cta-btn">{{ $isTrial ? 'Activer mon abonnement' : 'Renouveler' }} →</a>
</div>
<p style="font-size:13px;color:#94a3b8;text-align:center">Des questions ? Écrivez-nous à <a href="mailto:support@ibigsoft.com" style="color:#ea580c">support@ibigsoft.com</a></p>
@endsection
