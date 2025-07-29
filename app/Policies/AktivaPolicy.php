<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Aktiva;
use Illuminate\Auth\Access\HandlesAuthorization;

class AktivaPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_any_aktiva');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Aktiva $aktiva): bool
    {
        return $user->can('view_aktiva');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_aktiva');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Aktiva $aktiva): bool
    {
        return $user->can('update_aktiva');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Aktiva $aktiva): bool
    {
        return $user->can('delete_aktiva');
    }

    /**
     * Determine whether the user can bulk delete.
     */
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_aktiva');
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, Aktiva $aktiva): bool
    {
        return $user->can('force_delete_aktiva');
    }

    /**
     * Determine whether the user can permanently bulk delete.
     */
    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_aktiva');
    }

    /**
     * Determine whether the user can restore.
     */
    public function restore(User $user, Aktiva $aktiva): bool
    {
        return $user->can('restore_aktiva');
    }

    /**
     * Determine whether the user can bulk restore.
     */
    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_aktiva');
    }

    /**
     * Determine whether the user can replicate.
     */
    public function replicate(User $user, Aktiva $aktiva): bool
    {
        return $user->can('replicate_aktiva');
    }

    /**
     * Determine whether the user can reorder.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder_aktiva');
    }
}
