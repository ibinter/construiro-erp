@extends('emails.layout')
@section('body')

{{-- Badge mise à jour majeure --}}
@if(!empty($changelog->is_major))
<div class="badge-danger" style="font-size:13px;padding:6px 16px;margin-bottom:20px;">
    &#9888; Mise à jour majeure
</div>
@else
<div class="badge-success" style="margin-bottom:20px;">
    &#128640; Nouvelle version disponible
</div>
@endif

{{-- Hero --}}
<div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:1px solid #fed7aa;border-radius:12px;padding:28px 24px;margin-bottom:28px;text-align:center;">
    <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ea580c;margin-bottom:8px;">CONSTRUIRO ERP</div>
    <div style="font-size:26px;font-weight:900;color:#0f172a;margin-bottom:6px;">
        Nouvelle mise à jour disponible
    </div>
    <div style="display:inline-block;background:#F58220;color:white;font-size:20px;font-weight:900;padding:6px 22px;border-radius:30px;letter-spacing:1px;">
        v{{ $changelog->version }}
    </div>
    @if($changelog->published_at)
    <div style="margin-top:10px;font-size:13px;color:#78716c;">
        Publiée le {{ $changelog->published_at->translatedFormat('d F Y') }}
    </div>
    @endif
</div>

{{-- Titre du changelog --}}
<div class="greeting" style="margin-bottom:12px;">{{ $changelog->title }}</div>

{{-- Contenu --}}
<div style="background:#f8fafc;border-left:4px solid #F58220;border-radius:0 8px 8px 0;padding:20px 24px;margin:20px 0;font-size:15px;line-height:1.8;color:#334155;">
    {!! nl2br(e($changelog->body)) !!}
</div>

{{-- Type de version --}}
@php
$typeLabels = [
    'feature'     => ['label' => 'Nouvelles fonctionnalités', 'color' => '#2563eb', 'bg' => '#eff6ff'],
    'fix'         => ['label' => 'Corrections de bugs',       'color' => '#16a34a', 'bg' => '#f0fdf4'],
    'improvement' => ['label' => 'Améliorations',             'color' => '#7c3aed', 'bg' => '#f5f3ff'],
    'security'    => ['label' => 'Sécurité',                  'color' => '#b91c1c', 'bg' => '#fef2f2'],
];
$typeInfo = $typeLabels[$changelog->type] ?? ['label' => ucfirst($changelog->type), 'color' => '#475569', 'bg' => '#f1f5f9'];
@endphp
<div style="margin:16px 0;">
    <span style="display:inline-block;background:{{ $typeInfo['bg'] }};color:{{ $typeInfo['color'] }};border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;">
        {{ $typeInfo['label'] }}
    </span>
</div>

{{-- CTA --}}
<div class="cta-block" style="margin-top:32px;">
    <a href="{{ url('/changelog') }}" class="cta-btn" style="font-size:16px;padding:16px 40px;">
        Voir toutes les nouveautés &#8594;
    </a>
</div>

<div class="divider"></div>

<p style="font-size:13px;color:#94a3b8;text-align:center;">
    Vous recevez cet email car vous avez un compte administrateur CONSTRUIRO.
    Pour ne plus recevoir ces notifications, contactez
    <a href="mailto:support@ibigsoft.com" style="color:#F58220;">support@ibigsoft.com</a>.
</p>

@endsection
