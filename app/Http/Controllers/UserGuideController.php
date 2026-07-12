<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserGuideController extends Controller
{
    public function download(Request $request, string $locale = 'fr'): Response
    {
        abort_unless(in_array($locale, ['fr', 'en']), 404);

        $pdf = Pdf::loadView('pdf.user_guide', [
            'locale'  => $locale,
            'version' => '1.0',
        ])
        ->setPaper('a4')
        ->setOption('isHtml5ParserEnabled', true)
        ->setOption('defaultFont', 'DejaVu Sans');

        $filename = $locale === 'fr'
            ? 'CONSTRUIRO_Guide_Utilisateur_FR.pdf'
            : 'CONSTRUIRO_User_Guide_EN.pdf';

        return $pdf->download($filename);
    }
}
