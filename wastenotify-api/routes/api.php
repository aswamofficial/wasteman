<?php

use App\Http\Controllers\Api\Admin\AdminContractorController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminLegalController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Contractor\ContractorProfileController;
use App\Http\Controllers\Api\Contractor\PickupController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LegalController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReportMapController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\WardController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Wasteman API
|--------------------------------------------------------------------------
| Served by XAMPP Apache at:
|   http://localhost/wastenotify/wastenotify-api/public/api
*/

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $database = 'connected';
    } catch (\Throwable $e) {
        $database = 'unavailable';
    }

    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'database' => $database,
        'laravel' => app()->version(),
        'php' => PHP_VERSION,
    ]);
});

/*
 * Unauthenticated auth endpoints. The 'login' limiter is deliberately tighter
 * than 'auth' and keys on email+IP as well as IP alone — see AppServiceProvider.
 */
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Public: Play requires the privacy policy readable without an account.
Route::get('/legal/{slug}', [LegalController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    /*
     * Static segments are declared before the {report} binding — otherwise
     * /reports/map and /reports/analyse get swallowed by the model binding and
     * 404 as "no such report".
     */
    Route::get('/reports/map', [ReportMapController::class, 'index']);
    Route::get('/reports', [ReportController::class, 'index']);

    // Uploading a photo and classifying it is the expensive path — throttle it
    // harder than ordinary reads so a stuck client can't burn API credit.
    Route::post('/reports/analyse', [ReportController::class, 'analyse'])->middleware('throttle:content');
    Route::post('/reports', [ReportController::class, 'store'])->middleware('throttle:content');

    Route::get('/reports/{report}', [ReportController::class, 'show']);
    Route::post('/reports/{report}/rate', [ReportController::class, 'rate']);

    Route::get('/stats', [StatsController::class, 'index']);

    Route::get('/wards', [WardController::class, 'index']);
    Route::get('/wards/locate', [WardController::class, 'locate']);
    Route::get('/wards/boundaries', [WardController::class, 'boundaries']);
    Route::get('/districts/boundaries', [DistrictController::class, 'boundaries']);

    // Push registration. Paired with sign-out on the client so a shared handset
    // doesn't keep delivering to whoever used it last.
    Route::post('/devices', [DeviceController::class, 'store']);
    Route::delete('/devices', [DeviceController::class, 'destroy']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'avatar']);
    Route::post('/profile/password', [ProfileController::class, 'password'])->middleware('throttle:auth');
    // Google Play requires in-app account deletion for any app with sign-up.
    Route::delete('/profile', [ProfileController::class, 'destroy'])->middleware('throttle:auth');

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read']);

    /*
     * Collectors (scrap contractors).
     *
     * Registration sits outside the verified gate on purpose — an applicant
     * has to be able to see that they're pending. Everything that exposes a
     * resident's address sits behind it.
     */
    Route::get('/contractor/profile', [ContractorProfileController::class, 'show']);
    Route::post('/contractor/profile', [ContractorProfileController::class, 'store']);

    Route::middleware('contractor.verified')->prefix('contractor')->group(function () {
        Route::get('/pickups', [PickupController::class, 'index']);
        Route::post('/pickups/{report}/accept', [PickupController::class, 'accept']);
        Route::post('/pickups/{report}/settle', [PickupController::class, 'settle']);
        Route::post('/pickups/{report}/reject', [PickupController::class, 'reject']);
        Route::post('/pickups/{report}/release', [PickupController::class, 'release']);
    });

    // The resident confirming the amount they were actually handed.
    Route::post('/reports/{report}/confirm-payment', [ReportController::class, 'confirmPayment']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/contractors', [AdminContractorController::class, 'index']);
        Route::post('/contractors/{contractor}', [AdminContractorController::class, 'update']);
        Route::get('/rates', [AdminContractorController::class, 'rates']);
        Route::post('/rates', [AdminContractorController::class, 'saveRates']);

        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/reports', [AdminReportController::class, 'index']);
        Route::get('/reports/{report}', [AdminReportController::class, 'show']);
        Route::post('/reports/{report}', [AdminReportController::class, 'update']);

        // Static path before the {user} binding, or it 404s as "no such user".
        Route::get('/users/assignable', [AdminUserController::class, 'assignable']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::post('/users/{user}', [AdminUserController::class, 'update']);
        Route::post('/users/{user}/suspend', [AdminUserController::class, 'suspend']);

        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::post('/settings', [AdminSettingController::class, 'update']);

        Route::get('/legal', [AdminLegalController::class, 'index']);
        Route::post('/legal/{slug}', [AdminLegalController::class, 'update']);
    });
});
