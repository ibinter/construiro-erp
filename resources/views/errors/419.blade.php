@extends('errors.layout')
@section('code', '419')
@section('title', 'Session expirée')
@section('message', 'Votre session a expiré pour des raisons de sécurité. Veuillez recharger la page et réessayer.')
@section('extra')
<div style="margin-top:1rem">
    <a href="{{ url()->previous() }}" class="btn btn-primary" onclick="window.location.reload(); return false;">↺ Recharger la page</a>
</div>
@endsection
