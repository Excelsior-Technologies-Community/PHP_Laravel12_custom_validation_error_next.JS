<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|min:3|max:50|regex:/^[a-zA-Z\s]+$/',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).+$/'
            ]
        ], [
            'name.required' => 'Name is required',
            'name.min' => 'Name must be at least 3 characters',
            'name.max' => 'Name cannot exceed 50 characters',
            'name.regex' => 'Name can only contain letters and spaces',
            'email.required' => 'Email is required',
            'email.email' => "Please enter a valid email address",
            'email.unique' => 'Email already exists',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.regex' => 'Password must contain uppercase, lowercase, number, and special character',
            'password.confirmed' => 'Password and Confirm Password must match'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Registration successful!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ], 201);
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);
        
        $exists = User::where('email', $request->email)->exists();
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Email is already taken' : 'Email is available'
        ]);
    }
}