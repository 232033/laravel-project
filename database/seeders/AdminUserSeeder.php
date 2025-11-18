<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء حساب الأدمن
        User::updateOrCreate(
            ['username' => 'alosh'],
            [
                'name' => 'Alosh Admin',
                'email' => 'alosh@trixa.com',
                'password' => Hash::make('131243ar'),
                'is_admin' => true,
            ]
        );

        $this->command->info('تم إنشاء حساب الأدمن بنجاح!');
        $this->command->info('اسم المستخدم: alosh');
        $this->command->info('كلمة المرور: 131243ar');
    }
}
