<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::orderBy('group')->orderBy('id')->get();

        return response()->json([
            'settings' => $settings->map(fn (Setting $s) => [
                'key' => $s->key,
                'value' => $s->cast(),
                'type' => $s->type,
                'group' => $s->group,
                'label' => $s->label,
                'help' => $s->help,
            ]),
            'groups' => $settings->pluck('group')->unique()->values(),
        ]);
    }

    /**
     * Save changed settings.
     *
     * Only keys that already exist are writable — the set of settings is
     * defined by the seeder, so a client can't invent configuration the app
     * doesn't understand.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable'],
        ]);

        $known = Setting::whereIn('key', array_keys($data['settings']))->get()->keyBy('key');
        $unknown = array_diff(array_keys($data['settings']), $known->keys()->all());

        foreach ($data['settings'] as $key => $value) {
            $setting = $known->get($key);
            if (! $setting) {
                continue;
            }

            if ($setting->type === 'int' && $value !== null && ! is_numeric($value)) {
                return response()->json(['message' => "{$setting->label} must be a number."], 422);
            }

            $setting->update([
                'value' => match ($setting->type) {
                    'bool' => filter_var($value, FILTER_VALIDATE_BOOL) ? '1' : '0',
                    default => $value === null ? null : (string) $value,
                },
            ]);
        }

        return response()->json([
            'message' => 'Settings saved.',
            'ignored' => array_values($unknown),
        ]);
    }
}
