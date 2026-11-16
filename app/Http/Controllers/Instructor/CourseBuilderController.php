<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Admin\CourseBuilderController as BaseCourseBuilderController;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Media;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Policies\CoursePolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseBuilderController extends BaseCourseBuilderController
{
    /**
     * Authorize course access via CoursePolicy::manageCourse().
     */
    protected function authorizeCourse(int $courseId): void
    {
        $user = auth()->user();
        if (! $user || ! app(CoursePolicy::class)->manageCourse($user, $courseId)) {
            abort(403, 'No tienes autorización para acceder o modificar este curso.');
        }
    }

    protected function resolveLessonCourseId(Lesson $lesson): int
    {
        if (! empty($lesson->curso_id)) {
            return (int) $lesson->curso_id;
        }

        if (! empty($lesson->leccion_id)) {
            $parentCourseId = Module::withoutGlobalScopes()
                ->where('id', $lesson->leccion_id)
                ->value('curso_id');

            if ($parentCourseId) {
                return (int) $parentCourseId;
            }
        }

        return 0;
    }

    protected function resolveQuizCourseId(Quiz $quiz): int
    {
        if (! empty($quiz->curso_id)) {
            return (int) $quiz->curso_id;
        }

        if (! empty($quiz->leccion_id)) {
            $lesson = Lesson::withoutGlobalScopes()->find($quiz->leccion_id);
            if ($lesson) {
                return $this->resolveLessonCourseId($lesson);
            }
        }

        return 0;
    }

    /**
     * Display the course builder interface for instructor with authorization check.
     */
    public function show($id)
    {
        $course = $id instanceof Course ? $id : Course::findOrFail($id);

        $this->authorizeCourse((int) $course->id);

        $course->load([
            'category',
            'modules.lessons.media',
            'modules.lessons.quizzes.questions.answers',
            'modules.lessons.homeworkAssignments',
        ]);

        $this->revealCorrectAnswers($course);

        return Inertia::render('Admin/Courses/Builder', [
            'course' => $course,
            'routePrefix' => 'instructor',
        ]);
    }

    public function storeModule(Request $request, Course $course)
    {
        $this->authorizeCourse((int) $course->id);

        return parent::storeModule($request, $course);
    }

    public function reorderModules(Request $request, Course $course)
    {
        $this->authorizeCourse((int) $course->id);

        return parent::reorderModules($request, $course);
    }

    public function updateModule(Request $request, Module $module)
    {
        $this->authorizeCourse((int) $module->curso_id);

        return parent::updateModule($request, $module);
    }

    public function destroyModule(Module $module)
    {
        $this->authorizeCourse((int) $module->curso_id);

        return parent::destroyModule($module);
    }

    public function storeLesson(Request $request, Module $module)
    {
        $this->authorizeCourse((int) $module->curso_id);

        return parent::storeLesson($request, $module);
    }

    public function reorderLessons(Request $request, Module $module)
    {
        $this->authorizeCourse((int) $module->curso_id);

        return parent::reorderLessons($request, $module);
    }

    public function updateLesson(Request $request, Lesson $lesson)
    {
        $this->authorizeCourse($this->resolveLessonCourseId($lesson));

        return parent::updateLesson($request, $lesson);
    }

    public function destroyLesson(Lesson $lesson)
    {
        $this->authorizeCourse($this->resolveLessonCourseId($lesson));

        return parent::destroyLesson($lesson);
    }

    public function storeMedia(Request $request, Lesson $lesson)
    {
        $this->authorizeCourse($this->resolveLessonCourseId($lesson));

        return parent::storeMedia($request, $lesson);
    }

    public function uploadChunk(Request $request)
    {
        $courseId = (int) ($request->input('course_id') ?? $request->input('curso_id') ?? 0);

        if (! $courseId && ($lessonId = $request->input('lesson_id') ?? $request->input('leccion_id'))) {
            $lesson = Lesson::withoutGlobalScopes()->find($lessonId);
            if ($lesson) {
                $courseId = $this->resolveLessonCourseId($lesson);
            }
        }

        $this->authorizeCourse($courseId);

        return parent::uploadChunk($request);
    }

    public function destroyMedia(Media $media)
    {
        $lesson = Lesson::withoutGlobalScopes()->find($media->leccion_id);
        $courseId = $lesson ? $this->resolveLessonCourseId($lesson) : 0;

        $this->authorizeCourse($courseId);

        return parent::destroyMedia($media);
    }

    public function storeQuiz(Request $request, Lesson $lesson)
    {
        $this->authorizeCourse($this->resolveLessonCourseId($lesson));

        return parent::storeQuiz($request, $lesson);
    }

    public function destroyQuiz(Quiz $quiz)
    {
        $this->authorizeCourse($this->resolveQuizCourseId($quiz));

        return parent::destroyQuiz($quiz);
    }

    public function duplicateQuiz(Quiz $quiz)
    {
        $this->authorizeCourse($this->resolveQuizCourseId($quiz));

        return parent::duplicateQuiz($quiz);
    }

    public function storeQuestion(Request $request, Quiz $quiz)
    {
        $this->authorizeCourse($this->resolveQuizCourseId($quiz));

        return parent::storeQuestion($request, $quiz);
    }

    public function updateQuestion(Request $request, Question $question)
    {
        $quiz = $question->quiz;
        $courseId = $quiz ? $this->resolveQuizCourseId($quiz) : 0;

        $this->authorizeCourse($courseId);

        return parent::updateQuestion($request, $question);
    }

    public function destroyQuestion(Question $question)
    {
        $quiz = $question->quiz;
        $courseId = $quiz ? $this->resolveQuizCourseId($quiz) : 0;

        $this->authorizeCourse($courseId);

        return parent::destroyQuestion($question);
    }

    public function storeHomework(Request $request, Lesson $lesson)
    {
        $this->authorizeCourse($this->resolveLessonCourseId($lesson));

        return parent::storeHomework($request, $lesson);
    }
}
