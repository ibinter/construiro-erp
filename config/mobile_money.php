<?php

return [
    'operators' => [
        'orange_money' => [
            'label'     => 'Orange Money',
            'countries' => ['CI', 'SN', 'ML', 'BF'],
        ],
        'mtn_momo' => [
            'label'     => 'MTN MoMo',
            'countries' => ['GH', 'CI', 'CM'],
        ],
        'wave' => [
            'label'     => 'Wave',
            'countries' => ['CI', 'SN'],
        ],
    ],

    'sandbox' => env('MOBILE_MONEY_SANDBOX', true),
];
