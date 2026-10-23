<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * The web app is served from the same origin as the API, so the browser
     * never needs any of this. The native builds do: a Capacitor webview
     * serves the bundle from its own localhost origin and every API call is
     * therefore cross-origin, even though it is the same application.
     *
     * All three Capacitor origins are listed because which one applies is a
     * function of platform and version, and getting it wrong fails in the
     * least helpful way available — the request never leaves the device, so
     * the app reports "could not reach the server" while the server is
     * perfectly healthy and its logs show nothing at all.
     *
     *   https://localhost      Android, Capacitor 4+ (androidScheme: https)
     *   http://localhost       Android, Capacitor 3 and earlier
     *   capacitor://localhost  iOS
     */
    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),
        'http://localhost:5299',
        'http://127.0.0.1:5299',
        // Capacitor native webviews
        'https://localhost',
        'http://localhost',
        'capacitor://localhost',
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
