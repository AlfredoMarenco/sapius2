<?php

return [
    'merchant_id' => env('OPENPAY_MERCHANT_ID', ''),
    'private_key' => env('OPENPAY_PRIVATE_KEY', ''),
    'public_key' => env('OPENPAY_PUBLIC_KEY', ''),
    'production' => env('OPENPAY_PRODUCTION', false),
    'sandbox' => env('OPENPAY_SANDBOX', true),
    'country' => env('OPENPAY_COUNTRY', 'MX'),
    'currency' => strtoupper((string) env('OPENPAY_CURRENCY', 'MXN')) === 'MX' ? 'MXN' : env('OPENPAY_CURRENCY', 'MXN'),
    'ip' => env('OPENPAY_IP', ''),
    'webhook_user' => env('OPENPAY_WEBHOOK_USER', ''),
    'webhook_password' => env('OPENPAY_WEBHOOK_PASSWORD', ''),
];
