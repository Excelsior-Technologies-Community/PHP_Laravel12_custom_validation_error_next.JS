<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [UserController::class, 'store']);
