<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class EvolutionPublished
{
    use Dispatchable;

    public function __construct(
        public string $moduleKey,
        public string $featureKey,
        public array  $changedPlans,
        public string $changedBy
    ) {}
}
