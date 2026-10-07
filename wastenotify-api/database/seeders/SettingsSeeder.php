<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * The configuration surface. Only keys defined here are writable from the
     * admin console, so the app can never be pointed at settings it doesn't
     * understand.
     *
     * Values that would be invented rather than known — the operator's contact
     * details — are left blank on purpose, and the console shows them as
     * "not set" rather than shipping a plausible-looking placeholder.
     */
    public function run(): void
    {
        $settings = [
            // Service targets
            ['overdue_days', '5', 'int', 'service', 'Overdue after (days)', 'A report open longer than this is flagged overdue.'],
            ['resolution_target_days', '4', 'int', 'service', 'Resolution target (days)', 'Shown to citizens as the expected turnaround.'],
            ['auto_assign', '0', 'bool', 'service', 'Auto-assign new reports', 'Assign each new report to the least-loaded staff member in its ward.'],

            // AI
            ['ai_enabled', '1', 'bool', 'ai', 'AI classification', 'Classify report photos automatically. Off falls back to the offline stub.'],
            ['ai_min_confidence', '60', 'int', 'ai', 'Review below confidence (%)', 'Classifications under this are flagged for an officer to confirm.'],

            // Contact — blank until the operator supplies them
            ['helpline_number', '', 'tel', 'contact', 'Helpline number', 'Shown in the app for emergencies and escalation.'],
            ['support_email', '', 'email', 'contact', 'Support email', 'Where citizens are told to write.'],
            ['operator_name', '', 'string', 'contact', 'Operating body', 'The municipal corporation responsible for this deployment. Named as the data controller in the privacy policy.'],
            // Both are legally required in the published policy, so they live
            // here rather than hard-coded — nobody but the operator can supply
            // them truthfully, and a placeholder would ship as if it were real.
            ['operator_address', '', 'string', 'contact', 'Registered address', 'Printed in the privacy policy. Google Play rejects a policy with no contactable address.'],
            ['grievance_officer', '', 'string', 'contact', 'Grievance officer', 'Name and contact of the grievance officer — required in India under the IT Rules 2021.'],

            // Citizen-facing behaviour
            ['public_map_enabled', '1', 'bool', 'privacy', 'Public map', 'Show all reports on the map. Off limits the map to the reporter’s own.'],
            ['show_reporter_to_staff', '1', 'bool', 'privacy', 'Share reporter contact with crews', 'Lets the assigned team call the reporter from the report screen.'],
        ];

        foreach ($settings as [$key, $value, $type, $group, $label, $help]) {
            Setting::updateOrCreate(
                ['key' => $key],
                // Only fill the value on first create — re-seeding must never
                // stomp an operator's configured value.
                ['type' => $type, 'group' => $group, 'label' => $label, 'help' => $help]
                + (Setting::where('key', $key)->exists() ? [] : ['value' => $value])
            );
        }
    }
}
