@extends('errors.layout')
@section('code', '419')
@section('title', 'Session expirée')
@section('emoji', '⏱️')
@section('message', 'Votre session a expiré pour des raisons de sécurité. Rechargez la page et recommencez votre action.')
@section('extra')
<div style="margin-bottom:1.5rem">
    <a href="javascript:window.location.reload()" class="btn btn-primary">↺ Recharger la page</a>
</div>
@endsection
