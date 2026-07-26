<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * API V1 — Projects
 * Scoped to the authenticated user's company (multi-tenant isolation).
 */
class ProjectController extends Controller
{
    /**
     * GET /api/v1/projects
     * List projects for the authenticated user's company (paginated, 20/page).
     */
    public function index(Request $request): JsonResponse
    {
        $projects = Project::where('company_id', $request->user()->company_id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($projects);
    }

    /**
     * GET /api/v1/projects/{id}
     * Show a single project (must belong to the same company).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $project = Project::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        return response()->json($project);
    }

    /**
     * POST /api/v1/projects
     * Create a new project scoped to the authenticated user's company.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'code'          => ['nullable', 'string', 'max:50'],
            'description'   => ['nullable', 'string'],
            'client_name'   => ['nullable', 'string', 'max:255'],
            'type'          => ['nullable', Rule::in(Project::TYPES)],
            'status'        => ['nullable', Rule::in(Project::STATUSES)],
            'budget_amount' => ['nullable', 'numeric', 'min:0'],
            'currency'      => ['nullable', 'string', 'size:3'],
            'start_date'    => ['nullable', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
            'country'       => ['nullable', 'string', 'max:100'],
            'city'          => ['nullable', 'string', 'max:100'],
            'address'       => ['nullable', 'string', 'max:255'],
        ]);

        $data['company_id'] = $request->user()->company_id;
        $data['status']     = $data['status'] ?? 'draft';

        $project = Project::create($data);

        return response()->json($project, 201);
    }

    /**
     * PUT /api/v1/projects/{id}
     * Update a project (must belong to the same company).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $project = Project::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $data = $request->validate([
            'name'          => ['sometimes', 'required', 'string', 'max:255'],
            'code'          => ['nullable', 'string', 'max:50'],
            'description'   => ['nullable', 'string'],
            'client_name'   => ['nullable', 'string', 'max:255'],
            'type'          => ['nullable', Rule::in(Project::TYPES)],
            'status'        => ['nullable', Rule::in(Project::STATUSES)],
            'budget_amount' => ['nullable', 'numeric', 'min:0'],
            'currency'      => ['nullable', 'string', 'size:3'],
            'start_date'    => ['nullable', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
            'country'       => ['nullable', 'string', 'max:100'],
            'city'          => ['nullable', 'string', 'max:100'],
            'address'       => ['nullable', 'string', 'max:255'],
            'progress'      => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $project->update($data);

        return response()->json($project);
    }

    /**
     * DELETE /api/v1/projects/{id}
     * Soft-delete a project (must belong to the same company).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $project = Project::where('company_id', $request->user()->company_id)
            ->findOrFail($id);

        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }
}
