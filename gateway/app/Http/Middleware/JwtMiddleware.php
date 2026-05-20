<?php

namespace App\Http\Middleware;

use App\Services\JwtService;
use Closure;
use Throwable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    public function __construct(private JwtService $jwtService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated. No token provided.'], 401);
        }

        try {
            $payload = $this->jwtService->decode($token);
            // Attach decoded payload for downstream middleware and controllers
            $request->attributes->set('jwt_payload', $payload);
            $request->attributes->set('auth_user_id', (int) $payload->sub);
        } catch (Throwable) {
            return response()->json(['message' => 'Token invalid or expired.'], 401);
        }

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization', '');
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }
}
