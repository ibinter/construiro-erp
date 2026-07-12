<?php

namespace App\Traits;

use App\Models\AuditLog;

/**
 * Ajouter ce trait sur un modèle Eloquent pour journaliser automatiquement
 * created / updated / deleted.
 *
 * Propriétés optionnelles à définir sur le modèle :
 *   protected array $auditExclude = ['updated_at'];  // colonnes à ignorer
 *   public string $auditModule = 'projects';         // libellé du module
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            AuditLog::record(
                action:      'created',
                module:      $model->auditModule ?? null,
                description: 'Création : ' . class_basename($model) . ' #' . $model->getKey(),
                newValues:   $model->getAuditableAttributes(),
                model:       $model,
            );
        });

        static::updated(function ($model) {
            $old = array_intersect_key($model->getOriginal(), $model->getDirty());
            $new = array_intersect_key($model->getAttributes(), $model->getDirty());

            // Exclure les colonnes sans intérêt
            $exclude = array_merge(['updated_at'], $model->auditExclude ?? []);
            foreach ($exclude as $col) {
                unset($old[$col], $new[$col]);
            }

            if (empty($old) && empty($new)) {
                return;
            }

            AuditLog::record(
                action:      'updated',
                module:      $model->auditModule ?? null,
                description: 'Modification : ' . class_basename($model) . ' #' . $model->getKey(),
                oldValues:   $old,
                newValues:   $new,
                model:       $model,
            );
        });

        static::deleted(function ($model) {
            AuditLog::record(
                action:      'deleted',
                module:      $model->auditModule ?? null,
                description: 'Suppression : ' . class_basename($model) . ' #' . $model->getKey(),
                oldValues:   $model->getAuditableAttributes(),
                model:       $model,
            );
        });
    }

    protected function getAuditableAttributes(): array
    {
        $attrs   = $this->getAttributes();
        $exclude = array_merge(['password', 'remember_token', 'updated_at'], $this->auditExclude ?? []);

        return array_diff_key($attrs, array_flip($exclude));
    }
}
