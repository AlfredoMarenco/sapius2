<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Storage;

class CourseCategoryService
{
    protected static string $filePath = 'config/course_categories.json';

    protected static function loadMap(): array
    {
        try {
            if (Storage::disk('local')->exists(self::$filePath)) {
                $decoded = json_decode(Storage::disk('local')->get(self::$filePath), true);
                return is_array($decoded) ? $decoded : [];
            }
        } catch (\Throwable $e) {
            //
        }
        return [];
    }

    public static function setForCourse(int $courseId, ?int $categoryId): void
    {
        $map = self::loadMap();
        if ($categoryId) {
            $map[(string) $courseId] = (int) $categoryId;
        } else {
            unset($map[(string) $courseId]);
        }
        Storage::disk('local')->put(self::$filePath, json_encode($map, JSON_PRETTY_PRINT));
    }

    public static function getCategoryIdForCourse(int $courseId): ?int
    {
        $map = self::loadMap();
        return isset($map[(string) $courseId]) ? (int) $map[(string) $courseId] : null;
    }

    public static function getCategoryForCourse(int $courseId): ?Category
    {
        $categoryId = self::getCategoryIdForCourse($courseId);
        return $categoryId ? Category::find($categoryId) : null;
    }
}
