<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secret;
    private string $algo;
    private int    $ttl;

    public function __construct()
    {
        $this->secret = config('jwt.secret');
        $this->algo   = config('jwt.algo', 'HS256');
        $this->ttl    = config('jwt.ttl', 60);
    }

    public function encode(User $user): string
    {
        $now = time();

        $payload = [
            'iss'  => config('app.url'),
            'sub'  => $user->id,
            'iat'  => $now,
            'exp'  => $now + ($this->ttl * 60),
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role instanceof \App\Models\Role ? $user->role->name : null,
            ],
        ];

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function decode(string $token): object
    {
        return JWT::decode($token, new Key($this->secret, $this->algo));
    }

    public function getUserIdFromToken(string $token): int
    {
        return (int) $this->decode($token)->sub;
    }
}
