<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Permite las peticiones API y streaming multimedia desde el cliente de
    | escritorio Electron (file:// y orígenes locales/producción).
    |
    */

    'paths' => ['api/*', 'alumno/medias/stream/*', 'alumno/preguntas/imagen/*', 'cursos/image/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Sapius-MAC', 'X-Requested-With', 'Accept', 'Origin'],

    'exposed_headers' => ['Content-Disposition', 'Content-Length', 'Accept-Ranges', 'Content-Range'],

    'max_age' => 0,

    'supports_credentials' => false,

];
