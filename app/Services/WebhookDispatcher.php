<?php

namespace App\Services;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookDispatcher
{
    /**
     * Envoie un événement à tous les webhooks actifs d'une entreprise
     * qui ont souscrit à cet événement.
     *
     * Note : les erreurs sont attrapées silencieusement pour ne pas bloquer
     * l'action principale de l'appelant.
     */
    public static function dispatch(int $companyId, string $event, array $data): void
    {
        $webhooks = Webhook::where('company_id', $companyId)
            ->where('is_active', true)
            ->whereJsonContains('events', $event)
            ->get();

        foreach ($webhooks as $webhook) {
            try {
                $payload = json_encode([
                    'event'     => $event,
                    'timestamp' => now()->toIso8601String(),
                    'data'      => $data,
                ]);

                $signature = 'sha256=' . hash_hmac('sha256', $payload, $webhook->secret);

                $response = Http::withHeaders([
                    'Content-Type'              => 'application/json',
                    'X-Construiro-Signature'    => $signature,
                    'X-Construiro-Event'        => $event,
                ])->timeout(5)->withBody($payload, 'application/json')->post($webhook->url);

                WebhookDelivery::create([
                    'webhook_id'      => $webhook->id,
                    'event_type'      => $event,
                    'payload'         => $data,
                    'response_status' => $response->status(),
                    'response_body'   => substr($response->body(), 0, 500),
                    'success'         => $response->successful(),
                    'delivered_at'    => now(),
                ]);

                $webhook->update([
                    'last_triggered_at' => now(),
                    'failure_count'     => $response->successful()
                        ? 0
                        : DB::raw('failure_count + 1'),
                ]);
            } catch (\Throwable $e) {
                Log::warning("WebhookDispatcher: échec livraison webhook #{$webhook->id} — {$e->getMessage()}");

                // Enregistrer quand même l'échec réseau
                try {
                    WebhookDelivery::create([
                        'webhook_id'      => $webhook->id,
                        'event_type'      => $event,
                        'payload'         => $data,
                        'response_status' => null,
                        'response_body'   => substr($e->getMessage(), 0, 500),
                        'success'         => false,
                        'delivered_at'    => now(),
                    ]);

                    $webhook->increment('failure_count');
                } catch (\Throwable) {
                    // Silencieux
                }
            }
        }
    }

    /**
     * Liste des événements disponibles pour la configuration des webhooks.
     *
     * @return string[]
     */
    public static function availableEvents(): array
    {
        return [
            'invoice.created',
            'invoice.paid',
            'invoice.overdue',
            'project.created',
            'project.updated',
            'project.completed',
            'quote.accepted',
            'quote.rejected',
            'payment.received',
            'employee.created',
            'employee.updated',
        ];
    }
}
