<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Unit;
use App\Models\Category;
use App\Models\Tool;
use App\Models\Year;
use App\Models\Aktiva;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MasterController extends Controller
{
    // Locations
    public function getLocations(Request $request)
    {
        $query = Location::with(['unit', 'user']);
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('number', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allLocations()
    {
        return response()->json(Location::with(['unit', 'user'])->withCount('assets')->get());
    }

    public function storeLocation(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|string|max:255|unique:locations,number',
            'floor' => 'required|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'user_id' => 'required|exists:users,id',
        ]);
        $location = Location::create($validated);
        return response()->json(['message' => 'Lokasi berhasil ditambahkan', 'location' => $location->load(['unit', 'user'])], 201);
    }

    public function updateLocation(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|string|max:255|unique:locations,number,' . $id,
            'floor' => 'required|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'user_id' => 'required|exists:users,id',
        ]);
        $location->update($validated);
        return response()->json(['message' => 'Lokasi berhasil diperbarui', 'location' => $location->load(['unit', 'user'])]);
    }

    public function destroyLocation($id)
    {
        Location::findOrFail($id)->delete();
        return response()->json(['message' => 'Lokasi berhasil dihapus']);
    }

    // Units
    public function getUnits(Request $request)
    {
        $query = Unit::query();
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('number', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allUnits()
    {
        return response()->json(Unit::withCount('asset')->get());
    }

    public function storeUnit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|string|max:255|unique:units,number',
        ]);
        $unit = Unit::create($validated);
        return response()->json(['message' => 'Unit berhasil ditambahkan', 'unit' => $unit], 201);
    }

    public function updateUnit(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|string|max:255|unique:units,number,' . $id,
        ]);
        $unit->update($validated);
        return response()->json(['message' => 'Unit berhasil diperbarui', 'unit' => $unit]);
    }

    public function destroyUnit($id)
    {
        Unit::findOrFail($id)->delete();
        return response()->json(['message' => 'Unit berhasil dihapus']);
    }

    // Categories
    public function getCategories(Request $request)
    {
        $query = Category::query();
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allCategories()
    {
        return response()->json(Category::all());
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:categories,code',
        ]);
        $category = Category::create($validated);
        return response()->json(['message' => 'Kategori berhasil ditambahkan', 'category' => $category], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:categories,code,' . $id,
        ]);
        $category->update($validated);
        return response()->json(['message' => 'Kategori berhasil diperbarui', 'category' => $category]);
    }

    public function destroyCategory($id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }

    // Tools
    public function getTools(Request $request)
    {
        $query = Tool::query();
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allTools()
    {
        return response()->json(Tool::all());
    }

    public function storeTool(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:tools,code',
            'code_name' => 'required|string|max:255',
        ]);
        $tool = Tool::create($validated);
        return response()->json(['message' => 'Alat berhasil ditambahkan', 'tool' => $tool], 201);
    }

    public function updateTool(Request $request, $id)
    {
        $tool = Tool::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:tools,code,' . $id,
            'code_name' => 'required|string|max:255',
        ]);
        $tool->update($validated);
        return response()->json(['message' => 'Alat berhasil diperbarui', 'tool' => $tool]);
    }

    public function destroyTool($id)
    {
        Tool::findOrFail($id)->delete();
        return response()->json(['message' => 'Alat berhasil dihapus']);
    }

    // Years
    public function getYears(Request $request)
    {
        $query = Year::query();
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('year', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allYears()
    {
        return response()->json(Year::all());
    }

    public function storeYear(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:years,code',
        ]);
        $year = Year::create($validated);
        return response()->json(['message' => 'Tahun berhasil ditambahkan', 'year' => $year], 201);
    }

    public function updateYear(Request $request, $id)
    {
        $year = Year::findOrFail($id);
        $validated = $request->validate([
            'year' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:years,code,' . $id,
        ]);
        $year->update($validated);
        return response()->json(['message' => 'Tahun berhasil diperbarui', 'year' => $year]);
    }

    public function destroyYear($id)
    {
        Year::findOrFail($id)->delete();
        return response()->json(['message' => 'Tahun berhasil dihapus']);
    }

    // Aktivas
    public function getAktivas(Request $request)
    {
        $query = Aktiva::query();
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allAktivas()
    {
        return response()->json(Aktiva::all());
    }

    public function storeAktiva(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:aktivas,code',
        ]);
        $aktiva = Aktiva::create($validated);
        return response()->json(['message' => 'Aktiva berhasil ditambahkan', 'aktiva' => $aktiva], 201);
    }

    public function updateAktiva(Request $request, $id)
    {
        $aktiva = Aktiva::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:aktivas,code,' . $id,
        ]);
        $aktiva->update($validated);
        return response()->json(['message' => 'Aktiva berhasil diperbarui', 'aktiva' => $aktiva]);
    }

    public function destroyAktiva($id)
    {
        Aktiva::findOrFail($id)->delete();
        return response()->json(['message' => 'Aktiva berhasil dihapus']);
    }

    // Users
    public function getUsers(Request $request)
    {
        $query = User::with('unit');
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }

    public function allUsers()
    {
        return response()->json(User::with('unit')->get());
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'unit_id' => 'required|exists:units,id',
            'role' => 'nullable|string'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'unit_id' => $validated['unit_id'],
            'role' => $validated['role'] ?? 'operator',
        ]);

        return response()->json(['message' => 'User berhasil ditambahkan', 'user' => $user->load('unit')], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'unit_id' => 'required|exists:units,id',
            'role' => 'nullable|string'
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'unit_id' => $validated['unit_id'],
            'role' => $validated['role'] ?? $user->role ?? 'operator',
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return response()->json(['message' => 'User berhasil diperbarui', 'user' => $user->load('unit')]);
    }

    public function destroyUser($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User berhasil dihapus']);
    }

    // Activity Logs
    public function getActivities(Request $request)
    {
        $query = Activity::with('causer');
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('log_name', 'like', "%{$search}%");
            });
        }
        return response()->json($query->latest()->paginate($request->integer('per_page', 10)));
    }
}
