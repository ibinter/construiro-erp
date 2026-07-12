<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'company_id', 'user_name', 'user_email',
        'action', 'module', 'model_type', 'model_id',
        'description', 'old_values', 'new_values',
        'ip_address', 'user_agent', 'url', 'method',
        'is_support_session', 'support_user_email',
    ];

    protected $casts = [
        'old_values'        => 'array',
        'new_values'        => 'array',
        'is_support_session' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public static function record(
        string $action,
        ?string $module = null,
        ?string $description = null,
        array $oldValues = [],
        array $newValues = [],
        ?Model $model = null,
    ): void {
        $request = request();
        $user    = auth()->user();

        static::create([
            'user_id'       => $user?->id,
            'company_id'    => $user?->company_id,
            'user_name'     => $user?->name,
            'user_email'    => $user?->email,
            'action'        => $action,
            'module'        => $module,
            'model_type'    => $model ? get_class($model) : null,
            'model_id'      => $model?->getKey(),
            'description'   => $description,
            'old_values'    => $oldValues ?: null,
            'new_values'    => $newValues ?: null,
            'ip_address'    => $request->ip(),
            'user_agent'    => substr($request->userAgent() ?? '', 0, 500),
            'url'           => $request->fullUrl(),
            'method'        => $request->method(),
        ]);
    }
}
