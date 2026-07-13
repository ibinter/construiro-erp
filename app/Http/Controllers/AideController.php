<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Aide', [
            'section' => request('section', 'accueil'),
        ]);
    }
}
