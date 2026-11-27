<?php

return [
    'captcha_data_sitekey' => env('CAPTCHA_DATA_SITEKEY'),
    'captcha_secret_key' => env('CAPTCHA_SECRET_KEY'),
    'support_whatsapp' => env('SUPPORT_WHATSAPP', '529992988744'),
    'unlock_whatsapp' => env('UNLOCK_WHATSAPP', '529993648594'),
    'qa_bot_enabled' => (bool) env('QA_BOT_ENABLED', true),
    'enforce_single_session' => (bool) env('ENFORCE_SINGLE_SESSION', true),
    'v2_pilot_restriction_enabled' => (bool) env('V2_PILOT_RESTRICTION_ENABLED', false),
    'redirect_public_landings' => (bool) env('REDIRECT_PUBLIC_LANDINGS_TO_PRODUCTION', false),
    'production_site_url' => env('APP_REAL_SITE_URL', 'https://sapius.com.mx'),
    'v2_site_url' => env('APP_V2_SITE_URL', 'https://v2.sapius.com.mx'),
];
