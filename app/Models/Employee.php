<?php

namespace App\Models;

use App\Traits\Auditable;

use App\Traits\BelongsToCompany;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Employé — ressource humaine rattachée à une entreprise.
 * Distinct d'un compte utilisateur (User) : un employé peut être affecté à un
 * chantier et regroupe ses pointages et bulletins de paie.
 */
class Employee extends Model
{
    use BelongsToCompany;
    use Auditable;
    use HasFactory, SoftDeletes;

    public const DEPARTMENTS = ['chantier', 'bureau', 'direction', 'logistique', 'autre'];
    public const CONTRACT_TYPES = ['cdi', 'cdd', 'journalier', 'stage', 'prestation'];
    public const STATUSES = ['active', 'suspended', 'terminated'];

    protected $fillable = [
        'company_id', 'agency_id', 'site_id',
        'matricule', 'first_name', 'last_name', 'job_title', 'department',
        'phone', 'email', 'hire_date', 'contract_type',
        'base_salary', 'currency', 'status', 'notes', 'is_active',
    ];

    protected $casts = [
        'hire_date'   => 'date',
        'base_salary' => 'decimal:2',
        'is_active'   => 'boolean',
    ];

    /** Expose le nom complet au frontend. */
    protected $appends = ['full_name'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    /** Nom complet « prénom nom ». */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /** Restreint la requête à l'entreprise de l'utilisateur (isolation multi-tenant). */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where('company_id', $user->company_id);
    }
}
