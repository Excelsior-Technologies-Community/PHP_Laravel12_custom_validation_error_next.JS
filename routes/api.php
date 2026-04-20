<?php

use App\Http\Controllers\Api\UserController;
<<<<<<< HEAD
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
=======
use Illuminate\Support\Facades\Route;

>>>>>>> stages

Route::post('/register', [UserController::class, 'store']);
