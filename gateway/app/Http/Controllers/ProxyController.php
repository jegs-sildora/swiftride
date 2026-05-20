<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    /**
     * Map of URL-segment service names to config keys.
     */
    private array $serviceMap = [
        'fleet'   => 'services.fleet.url',
        'crm'     => 'services.crm.url',
        'booking' => 'services.booking.url',
        'billing' => 'services.billing.url',
    ];

    /**
     * Services that require an elevated role (admin or dispatcher).
     */
    private array $restrictedServices = ['billing'];

    /**
     * Forward an authenticated request to the appropriate microservice.
     *
     * The decoded JWT payload is forwarded as custom headers so downstream
     * services can trust the caller's identity without re-validating JWT.
     */
    public function proxy(Request $request, string $service, string $path = ''): JsonResponse
    {
        if (!array_key_exists($service, $this->serviceMap)) {
            return response()->json(['message' => "Service '{$service}' not found."], 404);
        }

        // Enforce role-based access for restricted services
        if (in_array($service, $this->restrictedServices, true)) {
            $jwtPayload = $request->attributes->get('jwt_payload');
            $role = (is_object($jwtPayload) && isset($jwtPayload->user->role))
                ? (string) $jwtPayload->user->role
                : '';
            if (!in_array($role, ['admin', 'dispatcher'], true)) {
                return response()->json(['message' => 'Forbidden. Insufficient role.'], 403);
            }
        }

        $baseUrl   = (string) config($this->serviceMap[$service], '');
        $targetUrl = rtrim($baseUrl, '/') . '/api/' . ltrim($path, '/');

        if ($qs = $request->getQueryString()) {
            $targetUrl .= '?' . $qs;
        }

        $jwtPayload = $request->attributes->get('jwt_payload');
        $authUserId = (is_object($jwtPayload) && isset($jwtPayload->sub))
            ? (string) $jwtPayload->sub
            : '';
        $authRole = (is_object($jwtPayload) && isset($jwtPayload->user->role))
            ? (string) $jwtPayload->user->role
            : '';

        $response = Http::withHeaders([
            'Accept'         => 'application/json',
            'Content-Type'   => 'application/json',
            'X-Auth-User-Id' => $authUserId,
            'X-Auth-Role'    => $authRole,
        ])
        ->timeout(30)
        ->send(
            $request->method(),
            $targetUrl,
            in_array($request->method(), ['GET', 'DELETE', 'HEAD'], true)
                ? []
                : ['json' => $request->all()],
        );

        return response()->json($response->json(), $response->status());
    }
}
