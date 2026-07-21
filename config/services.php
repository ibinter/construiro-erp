<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'groq' => [
        'key' => env('GROQ_API_KEY'),
    ],

    // ─── Mobile Money ──────────────────────────────────────────────────────────

    'orange_money' => [
        'sandbox'        => env('ORANGE_MONEY_SANDBOX', true),
        'country'        => env('ORANGE_MONEY_COUNTRY', 'ci'),       // ci, sn, ml, bf, cm…
        'merchant_key'   => env('ORANGE_MONEY_MERCHANT_KEY', ''),
        'login'          => env('ORANGE_MONEY_LOGIN', ''),
        'pin'            => env('ORANGE_MONEY_PIN', ''),
        'webhook_secret' => env('ORANGE_MONEY_WEBHOOK_SECRET', ''),
        'notif_url'      => env('ORANGE_MONEY_NOTIF_URL', ''),       // laisser vide → auto url()
        'return_url'     => env('ORANGE_MONEY_RETURN_URL', ''),      // laisser vide → /billing
    ],

    'mtn_momo' => [
        'environment'      => env('MTN_MOMO_ENVIRONMENT', 'sandbox'), // sandbox | mtncameroon | mtnivorycoast…
        'subscription_key' => env('MTN_MOMO_SUBSCRIPTION_KEY', ''),
        'api_user'         => env('MTN_MOMO_API_USER', ''),           // UUID créé à l'onboarding
        'api_key'          => env('MTN_MOMO_API_KEY', ''),
        'callback_host'    => env('MTN_MOMO_CALLBACK_HOST', ''),
        'webhook_secret'   => env('MTN_MOMO_WEBHOOK_SECRET', ''),     // optionnel
    ],

    'wave' => [
        'api_key'        => env('WAVE_API_KEY', ''),
        'webhook_secret' => env('WAVE_WEBHOOK_SECRET', ''),
    ],

];
