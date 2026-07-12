<?php

namespace App\Http\Controllers;

use App\Mail\DemoRequestedMail;
use App\Models\DemoRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class DemoRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'phone'   => 'nullable|string|max:30',
            'company' => 'required|string|max:150',
            'sector'  => 'nullable|string|max:100',
            'message' => 'nullable|string|max:1000',
        ]);

        $demo = DemoRequest::create($validated);

        try {
            Mail::to($validated['email'])->send(new DemoRequestedMail(
                userName: $validated['name'],
                company: $validated['company'],
                sector: $validated['sector'] ?? 'Non précisé',
            ));
        } catch (\Throwable) {
            // Non bloquant — la demande est sauvegardée même si l'email échoue
        }

        return back()->with('success', 'Demande envoyée avec succès.');
    }
}
