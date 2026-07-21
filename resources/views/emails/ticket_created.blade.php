@extends('emails.layout')
@section('body')

{{-- Badge --}}
<div class="badge-success" style="font-size:13px;padding:6px 16px;">
    &#128229; Ticket #{{ $ticketNumber }} enregistre
</div>

<div class="greeting">Votre demande est prise en charge, {{ $userName }}.</div>

<p>
    Notre equipe support a bien recu votre demande et y travaille.
    Vous recevrez une notification a chaque mise a jour du ticket.
</p>

{{-- Ticket card --}}
<div style="border:2px solid #1E3A5F;border-radius:12px;overflow:hidden;margin:24px 0;">
    <div style="background:#1E3A5F;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:white;font-weight:700;font-size:15px;">Ticket #{{ $ticketNumber }}</span>
        @php
        $priorityColor = match(strtolower($priority)) {
            'urgent','critique' => '#dc2626',
            'haute','high'      => '#ea580c',
            'normale','medium'  => '#2563eb',
            default             => '#16a34a',
        };
        @endphp
        <span style="background:{{ $priorityColor }};color:white;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;">
            Priorite {{ $priority }}
        </span>
    </div>
    <div style="padding:0 24px;background:white;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:600;width:35%;">Objet</td>
                <td style="padding:12px 0;font-weight:700;color:#0f172a;">{{ $subject }}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:600;">Statut</td>
                <td style="padding:12px 0;">
                    <span style="background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;padding:3px 12px;border-radius:20px;">
                        &#128307; Nouveau
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding:12px 0;color:#64748b;font-weight:600;">Delai de reponse</td>
                <td style="padding:12px 0;font-weight:600;color:#0f172a;">
                    @if(in_array(strtolower($priority), ['urgent','critique']))
                        Sous 4 heures
                    @elseif(in_array(strtolower($priority), ['haute','high']))
                        Sous 24 heures
                    @else
                        Sous 48 heures (jours ouvrables)
                    @endif
                </td>
            </tr>
        </table>
    </div>
</div>

{{-- What happens next --}}
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0;">
    <p style="font-weight:700;color:#0f172a;margin-bottom:16px;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">
        Ce qui se passe maintenant
    </p>
    @php
    $steps = [
        ['icon'=>'&#128229;', 'label'=>'Ticket recu','desc'=>'Votre demande est enregistree dans notre systeme.','done'=>true],
        ['icon'=>'&#128269;', 'label'=>'Analyse en cours','desc'=>'Un technicien analyse votre probleme.','done'=>false],
        ['icon'=>'&#128172;', 'label'=>'Reponse envoyee','desc'=>'Vous recevrez la solution par email.','done'=>false],
        ['icon'=>'&#10003;',  'label'=>'Resolution','desc'=>'Ticket ferme apres validation de votre part.','done'=>false],
    ];
    @endphp
    @foreach($steps as $i => $step)
    <div style="display:flex;gap:16px;align-items:flex-start;{{ !$loop->last ? 'margin-bottom:14px;padding-bottom:14px;border-bottom:1px dashed #e2e8f0;' : '' }}">
        <div style="width:36px;height:36px;border-radius:50%;background:{{ $step['done'] ? '#1E3A5F' : '#f1f5f9' }};border:2px solid {{ $step['done'] ? '#1E3A5F' : '#cbd5e1' }};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">
            <span style="color:{{ $step['done'] ? 'white' : '#94a3b8' }};">{{ $step['icon'] }}</span>
        </div>
        <div>
            <p style="font-weight:700;color:{{ $step['done'] ? '#0f172a' : '#94a3b8' }};margin-bottom:2px;font-size:14px;">{{ $step['label'] }}</p>
            <p style="font-size:13px;color:#94a3b8;margin:0;">{{ $step['desc'] }}</p>
        </div>
    </div>
    @endforeach
</div>

<div class="cta-block">
    <a href="{{ $ticketUrl }}" class="cta-btn">
        Suivre mon ticket &#8594;
    </a>
</div>

<div class="divider"></div>

<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 20px;margin-bottom:8px;">
    <p style="font-size:13px;color:#0369a1;margin:0;line-height:1.6;">
        <strong>Conseil :</strong> pour accel&#233;rer la resolution, ajoutez des captures d'ecran
        ou des fichiers directement depuis votre espace support.
        <a href="{{ $ticketUrl }}" style="color:#F58220;font-weight:600;">Ajouter une piece jointe</a>
    </p>
</div>

@endsection
