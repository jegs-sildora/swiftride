<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private JwtService $jwtService) {}

    /**
     * Register a new staff/dispatcher/admin user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|max:255|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => 'sometimes|string|in:admin,dispatcher,staff',
        ]);

        $role = Role::where('name', $validated['role'] ?? 'staff')->firstOrFail();

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'role_id'  => $role->id,
        ]);

        $user->load('role');
        $token = $this->jwtService->encode($user);

        return response()->json([
            'message' => 'User registered successfully.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    /**
     * Authenticate and issue a JWT.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('role')->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return response()->json([
            'token' => $this->jwtService->encode($user),
            'user'  => $user,
        ]);
    }

    /**
     * Return the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = User::with('role')->findOrFail($request->attributes->get('auth_user_id'));
        return response()->json($user);
    }

    /**
     * Issue a fresh token for the authenticated user.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user  = User::with('role')->findOrFail($request->attributes->get('auth_user_id'));
        $token = $this->jwtService->encode($user);
        return response()->json(['token' => $token]);
    }

    /**
     * Stateless logout — instruct the client to discard the token.
     * Note: In a production environment with strict security requirements, 
     * consider implementing token blocklisting (e.g., via Redis) to invalidate tokens before expiration.
     */
    public function logout(): JsonResponse
    {
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
