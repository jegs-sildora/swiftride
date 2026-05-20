<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Grant access only if the authenticated user holds one of the given roles.
     * Usage: Route::middleware('jwt.role:admin,dispatcher')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $userId = $request->attributes->get('auth_user_id');
        $user   = User::with('role')->find($userId);

        if (!$user || !($user->role instanceof \App\Models\Role) || !in_array($user->role->name, $roles, true)) {
            return response()->json(['message' => 'Forbidden. Insufficient role.'], 403);
        }

        return $next($request);
    }
}
