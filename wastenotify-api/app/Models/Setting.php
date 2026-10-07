<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $guarded = ['id'];

    private const CACHE_KEY = 'settings.all';

    protected static function booted(): void
    {
        // Settings are read on almost every request and written rarely, so the
        // whole table is cached and the cache dropped on any write.
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return array<string, mixed> key => cast value */
    public static function all_values(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::query()
            ->get()
            ->mapWithKeys(fn (Setting $s) => [$s->key => $s->cast()])
            ->all());
    }

    public static function value(string $key, mixed $default = null): mixed
    {
        return static::all_values()[$key] ?? $default;
    }

    public function cast(): mixed
    {
        return match ($this->type) {
            'int' => (int) $this->value,
            'bool' => filter_var($this->value, FILTER_VALIDATE_BOOL),
            default => $this->value,
        };
    }
}
