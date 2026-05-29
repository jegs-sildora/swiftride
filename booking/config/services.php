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

    /*
    |--------------------------------------------------------------------------
    | SwiftRide Inter-Service URLs
    |--------------------------------------------------------------------------
    */

    'fleet' => [
        'url' => env('FLEET_HOSTPORT') ? 'https://' . explode(':', env('FLEET_HOSTPORT'))[0] . '.onrender.com' : env('FLEET_SERVICE_URL', 'http://fleet:8001'),
    ],

    'crm' => [
        'url' => env('CRM_HOSTPORT') ? 'https://' . explode(':', env('CRM_HOSTPORT'))[0] . '.onrender.com' : env('CRM_SERVICE_URL', 'http://crm:8002'),
    ],

    'billing' => [
        'url' => env('BILLING_HOSTPORT') ? 'https://' . explode(':', env('BILLING_HOSTPORT'))[0] . '.onrender.com' : env('BILLING_SERVICE_URL', 'http://billing:8004'),
    ],

];
