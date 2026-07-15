<?php
namespace App\Services\Pdf;
class ColumnDefinition {
    /** Règles par type : min/max en mm, poids flex, nowrap */
    public const RULES = [
        'id'         => ['min' => 12, 'max' => 20, 'flex' => 0.7, 'nowrap' => true],
        'code'       => ['min' => 16, 'max' => 32, 'flex' => 1.0, 'nowrap' => true],
        'reference'  => ['min' => 22, 'max' => 42, 'flex' => 1.2, 'nowrap' => true],
        'name'       => ['min' => 22, 'max' => 55, 'flex' => 2.5, 'nowrap' => false],
        'email'      => ['min' => 42, 'max' => 72, 'flex' => 3.0, 'nowrap' => false],
        'phone'      => ['min' => 24, 'max' => 36, 'flex' => 1.0, 'nowrap' => true],
        'date'       => ['min' => 20, 'max' => 27, 'flex' => 0.8, 'nowrap' => true],
        'datetime'   => ['min' => 32, 'max' => 45, 'flex' => 1.0, 'nowrap' => true],
        'amount'     => ['min' => 22, 'max' => 40, 'flex' => 1.0, 'nowrap' => true],
        'percentage' => ['min' => 14, 'max' => 22, 'flex' => 0.6, 'nowrap' => true],
        'status'     => ['min' => 18, 'max' => 32, 'flex' => 0.9, 'nowrap' => false],
        'number'     => ['min' => 14, 'max' => 26, 'flex' => 0.7, 'nowrap' => true],
        'boolean'    => ['min' => 12, 'max' => 20, 'flex' => 0.5, 'nowrap' => true],
        'short_text' => ['min' => 30, 'max' => 75, 'flex' => 2.0, 'nowrap' => false],
        'long_text'  => ['min' => 50, 'max' => 110, 'flex' => 4.0, 'nowrap' => false],
        'default'    => ['min' => 20, 'max' => 60, 'flex' => 1.5, 'nowrap' => false],
    ];

    public static function rulesFor(string $type): array {
        return self::RULES[$type] ?? self::RULES['default'];
    }
}
