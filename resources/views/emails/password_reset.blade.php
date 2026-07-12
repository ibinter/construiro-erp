@extends('emails.layout')
@section('body')
<div class="greeting">Réinitialisation de votre mot de passe</div>
<p>Bonjour {{ $userName }}, vous avez demandé la réinitialisation de votre mot de passe CONSTRUIRO.</p>
<p>Ce lien expirera dans <strong>{{ $expiresIn }} minutes</strong>. Si vous n'avez pas fait cette demande, ignorez cet email — votre compte reste sécurisé.</p>
<div class="cta-block">
    <a href="{{ $resetUrl }}" class="cta-btn">Réinitialiser mon mot de passe →</a>
</div>
<p style="font-size:12px;color:#64748b;text-align:center;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>{{ $resetUrl }}</p>
@endsection
