<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Ici sont définis les canaux de diffusion autorisés.
| Le canal privé "company.{id}" est accessible uniquement aux utilisateurs
| authentifiés appartenant à l'entreprise concernée (multi-tenant).
|
*/

Broadcast::channel('company.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});
