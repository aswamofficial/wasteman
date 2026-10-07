<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    /**
     * Realistic sample reports around Gandhipuram, Coimbatore so the dashboard,
     * map and activity list all have something true to render before the
     * capture flow is built.
     */
    public function run(): void
    {
        $citizen = User::where('email', 'demo@wastenotify.com')->first();
        $admin = User::where('email', 'admin@wastenotify.com')->first();

        if (! $citizen) {
            return;
        }

        $samples = [
            [
                'address' => '142, Cross Cut Road, Gandhipuram, Coimbatore 641012',
                'latitude' => 11.0168, 'longitude' => 76.9558,
                'waste_type' => 'Mixed household waste', 'ai_confidence' => 94,
                'severity' => 'high', 'estimated_weight_kg' => 40,
                'detected_items' => ['plastic bags', 'food waste', 'cardboard'],
                'status' => Report::STATUS_IN_PROGRESS,
                'crew' => 'Crew B',
                'present_since' => 'few_days', 'blocking' => 'drain',
                'days_ago' => 2,
            ],
            [
                'address' => '5th Street, Kaveri Nagar, Coimbatore 641025',
                'latitude' => 11.0221, 'longitude' => 76.9612,
                'waste_type' => 'Construction debris', 'ai_confidence' => 88,
                'severity' => 'high', 'estimated_weight_kg' => 120,
                'detected_items' => ['broken bricks', 'cement bags', 'tiles'],
                'status' => Report::STATUS_PENDING,
                'present_since' => 'over_a_week', 'blocking' => 'footpath',
                'days_ago' => 6,
            ],
            [
                'address' => 'Opposite Bus Stand, Sathy Road, Coimbatore 641011',
                'latitude' => 11.0102, 'longitude' => 76.9701,
                'waste_type' => 'Overflowing bin', 'ai_confidence' => 96,
                'severity' => 'medium', 'estimated_weight_kg' => 25,
                'detected_items' => ['plastic bottles', 'wrappers'],
                'status' => Report::STATUS_PENDING,
                'present_since' => 'today', 'blocking' => 'nothing',
                'days_ago' => 0,
            ],
            [
                'address' => '18, Bharathi Park Road, Saibaba Colony, Coimbatore 641011',
                'latitude' => 11.0295, 'longitude' => 76.9483,
                'waste_type' => 'Garden and organic waste', 'ai_confidence' => 91,
                'severity' => 'low', 'estimated_weight_kg' => 60,
                'detected_items' => ['leaves', 'branches'],
                'status' => Report::STATUS_RESOLVED,
                'crew' => 'Crew A',
                'present_since' => 'few_days', 'blocking' => 'road',
                'days_ago' => 9, 'resolved_days_ago' => 7, 'rating' => 5,
            ],
            [
                'address' => 'Near Railway Gate, Ram Nagar, Coimbatore 641009',
                'latitude' => 11.0056, 'longitude' => 76.9689,
                'waste_type' => 'Plastic waste', 'ai_confidence' => 97,
                'severity' => 'medium', 'estimated_weight_kg' => 35,
                'detected_items' => ['plastic sheets', 'bottles', 'packaging'],
                'status' => Report::STATUS_RESOLVED,
                'crew' => 'Crew B',
                'present_since' => 'over_a_week', 'blocking' => 'drain',
                'days_ago' => 15, 'resolved_days_ago' => 12, 'rating' => 4,
            ],
            [
                'address' => '77, Trichy Road, Ramanathapuram, Coimbatore 641045',
                'latitude' => 10.9925, 'longitude' => 76.9781,
                'waste_type' => 'E-waste', 'ai_confidence' => 84,
                'severity' => 'high', 'estimated_weight_kg' => 18,
                'detected_items' => ['monitors', 'cables', 'circuit boards'],
                'status' => Report::STATUS_RESOLVED,
                'crew' => 'Crew A',
                'present_since' => 'few_days', 'blocking' => 'footpath',
                'days_ago' => 22, 'resolved_days_ago' => 19, 'rating' => 5,
            ],
        ];

        foreach ($samples as $s) {
            $createdAt = now()->subDays($s['days_ago'])->setTime(9, 42);

            Report::updateOrCreate(
                ['address' => $s['address'], 'user_id' => $citizen->id],
                [
                    // No 'reference' here: updateOrCreate evaluates this array
                    // on the update path too, so generating one would collide
                    // with the row's existing reference. Report::creating
                    // assigns it on insert only.
                    'photo_path' => 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=70',
                    'latitude' => $s['latitude'],
                    'longitude' => $s['longitude'],
                    'waste_type' => $s['waste_type'],
                    'ai_confidence' => $s['ai_confidence'],
                    'severity' => $s['severity'],
                    'estimated_weight_kg' => $s['estimated_weight_kg'],
                    'detected_items' => $s['detected_items'],
                    'analysed_at' => $createdAt,
                    'status' => $s['status'],
                    'assigned_team' => isset($s['crew']) ? $this->teamName($s['latitude'], $s['longitude'], $s['crew']) : null,
                    'present_since' => $s['present_since'],
                    'blocking' => $s['blocking'],
                    'resolution_photo_path' => isset($s['resolved_days_ago'])
                        ? 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=800&q=70'
                        : null,
                    'resolved_at' => isset($s['resolved_days_ago'])
                        ? now()->subDays($s['resolved_days_ago'])
                        : null,
                    'resolved_by' => isset($s['resolved_days_ago']) ? $admin?->id : null,
                    'rating' => $s['rating'] ?? null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]
            );
        }
    }

    /**
     * Crew names are built from the report's real ward, resolved by
     * point-in-polygon — so a sample report in ward 69 reads "Ward 69 — Crew B"
     * and never a ward number someone made up.
     */
    private function teamName(float $lat, float $lng, string $crew): string
    {
        $ward = Ward::containing($lat, $lng);

        return $ward ? "Ward {$ward->ward_no} — {$crew}" : $crew;
    }
}
