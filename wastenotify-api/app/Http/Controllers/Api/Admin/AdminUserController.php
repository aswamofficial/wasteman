<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    private const ROLES = ['admin', 'staff', 'citizen'];

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'role' => ['nullable', Rule::in([...self::ROLES, 'all'])],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'status' => ['nullable', 'in:all,active,suspended'],
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        $query = User::query()->with(['ward', 'roles:id,name']);

        if (! empty($data['role']) && $data['role'] !== 'all') {
            $query->role($data['role']);
        }
        if (! empty($data['ward_id'])) {
            $query->where('ward_id', $data['ward_id']);
        }
        if (($data['status'] ?? 'all') === 'active') {
            $query->whereNull('suspended_at');
        } elseif (($data['status'] ?? 'all') === 'suspended') {
            $query->whereNotNull('suspended_at');
        }
        if (! empty($data['q'])) {
            $term = '%'.$data['q'].'%';
            $query->where(fn ($q) => $q->where('name', 'like', $term)
                ->orWhere('email', 'like', $term)
                ->orWhere('phone', 'like', $term));
        }

        $users = $query
            ->withCount('reports')
            ->withCount(['assignedReports as open_assigned' => fn ($q) => $q->whereIn('status', [
                Report::STATUS_PENDING, Report::STATUS_IN_PROGRESS,
            ])])
            ->orderBy('name')
            ->paginate(30);

        return response()->json([
            'users' => UserResource::collection($users->items()),
            // Nesting a paginated ResourceCollection inside response()->json()
            // silently drops the pagination wrapper, so the meta is built
            // explicitly — otherwise the console can never page past the first 30.
            'pagination' => [
                'page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
            'counts' => [
                'all' => User::count(),
                'admin' => User::role('admin')->count(),
                'staff' => User::role('staff')->count(),
                'citizen' => User::role('citizen')->count(),
                'suspended' => User::whereNotNull('suspended_at')->count(),
            ],
            'roles' => self::ROLES,
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['ward', 'roles:id,name'])->loadCount('reports');

        return response()->json([
            'user' => new UserResource($user),
            'recent_reports' => $user->reports()->latest()->limit(10)->get()
                ->map(fn (Report $r) => [
                    'id' => $r->id,
                    'reference' => $r->reference,
                    'waste_type' => $r->waste_type,
                    'status' => $r->status,
                    'created_for_humans' => $r->created_at?->diffForHumans(),
                ]),
            'assigned_open' => $user->assignedReports()
                ->whereIn('status', [Report::STATUS_PENDING, Report::STATUS_IN_PROGRESS])
                ->count(),
        ]);
    }

    /**
     * Change a user's role, ward, or contact details.
     *
     * Roles and wards are what decide who sees which queue, so this is the
     * "assign a user to a ward" control as well as the role editor.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:180', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^\+?[0-9 ]{8,20}$/', Rule::unique('users')->ignore($user->id)],
            'ward_id' => ['sometimes', 'nullable', 'integer', 'exists:wards,id'],
            'role' => ['sometimes', Rule::in(self::ROLES)],
        ]);

        // Don't let an admin strip their own admin role and lock themselves
        // out of the console mid-session.
        if (isset($data['role']) && $user->id === $request->user()->id && $data['role'] !== 'admin') {
            return response()->json(['message' => 'You cannot change your own role.'], 422);
        }

        $user->fill(collect($data)->except('role')->all())->save();

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return response()->json([
            'message' => 'User updated.',
            'user' => new UserResource($user->fresh()->load(['ward', 'roles:id,name'])->loadCount('reports')),
        ]);
    }

    /**
     * Suspend or restore an account.
     *
     * Suspension, not deletion — the person's reports remain valid civic
     * records and their history stays auditable; they simply can't sign in.
     */
    public function suspend(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'suspended' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:200'],
        ]);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot suspend your own account.'], 422);
        }

        if ($data['suspended']) {
            $user->forceFill([
                'suspended_at' => now(),
                'suspended_reason' => $data['reason'] ?? null,
            ])->save();
            // Kill their sessions immediately, or a suspension does nothing
            // until their token happens to expire.
            $user->tokens()->delete();
        } else {
            $user->forceFill(['suspended_at' => null, 'suspended_reason' => null])->save();
        }

        return response()->json([
            'message' => $data['suspended'] ? 'Account suspended.' : 'Account restored.',
            'user' => new UserResource($user->fresh()->load(['ward', 'roles:id,name'])),
        ]);
    }

    /** Staff who can take an assignment, for the assignee picker. */
    public function assignable(Request $request): JsonResponse
    {
        $ward = $request->user()->ward;

        $users = User::role(['admin', 'staff'])
            ->whereNull('suspended_at')
            ->when($ward, fn ($q) => $q->where(fn ($w) => $w
                ->where('ward_id', $ward->id)
                ->orWhereNull('ward_id')))
            ->withCount(['assignedReports as open_assigned' => fn ($q) => $q->whereIn('status', [
                Report::STATUS_PENDING, Report::STATUS_IN_PROGRESS,
            ])])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'ward_id']);

        return response()->json([
            'users' => $users->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'open_assigned' => (int) $u->open_assigned,
            ]),
        ]);
    }
}
