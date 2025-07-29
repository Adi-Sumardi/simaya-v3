<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\User;

class LogLastLogin
{
    public function handle(Login $event): void
    {
        /** @var User $user */
        $user = $event->user;
        $user->last_login_at = now()->setTimezone('Asia/Jakarta');
        $user->save();
    }

}
