<?php
/**
 * Contrôleur Training & E-Learning pour IntraSphere
 */

require_once __DIR__ . '/../Models/Training.php';
require_once __DIR__ . '/../Models/Course.php';
require_once __DIR__ . '/../Models/Lesson.php';

class TrainingController {
    private $trainingModel;
    private $courseModel;
    private $lessonModel;

    public function __construct() {
        $this->trainingModel = new Training();
        $this->courseModel   = new Course();
        $this->lessonModel   = new Lesson();
    }

    // GET /api/trainings
    public function index($params, $input) {
        AuthMiddleware::handle();
        $data = $this->trainingModel->paginate(
            (int)($input['page'] ?? 1),
            (int)($input['limit'] ?? 20),
            '1=1', [], 'start_date ASC'
        );
        Response::success($data);
    }

    // GET /api/trainings/{id}
    public function show($params, $input) {
        AuthMiddleware::handle();
        $training = $this->trainingModel->findById($params['id']);
        if (!$training) Response::notFound('Training not found');
        Response::success($training);
    }

    // POST /api/trainings
    public function store($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->trainingModel->create([
            'title'           => $input['title'],
            'description'     => $input['description'] ?? '',
            'trainer'         => $input['trainer'] ?? null,
            'start_date'      => $input['start_date'],
            'end_date'        => $input['end_date'],
            'location'        => $input['location'] ?? null,
            'max_participants'=> $input['max_participants'] ?? null,
            'status'          => 'scheduled'
        ]);
        $training = $this->trainingModel->findById($id);
        Response::success($training, 'Training created', 201);
    }

    // POST /api/enroll
    public function enroll($params, $input) {
        AuthMiddleware::handle();
        $trainingId = $input['training_id'];
        $userId     = $_SESSION['user_id'];
        $this->trainingModel->addParticipant($trainingId, $userId);
        Response::success(null, 'Enrolled');
    }

    // GET /api/trainings/{id}/participants
    public function participants($params, $input) {
        AuthMiddleware::handle();
        $parts = $this->trainingModel->getParticipants($params['id']);
        Response::success($parts);
    }

    // GET /api/courses
    public function courses($params, $input) {
        AuthMiddleware::handle();
        $courses = $this->courseModel->findAll(null, 0, 'created_at DESC');
        Response::success($courses);
    }

    // GET /api/courses/{id}
    public function courseDetails($params, $input) {
        AuthMiddleware::handle();
        $course = $this->courseModel->findById($params['id']);
        if (!$course) Response::notFound('Course not found');
        $course['lessons'] = $this->lessonModel->findWhere(
            'course_id = ?', [$params['id']], null, 0, 'order_index ASC'
        );
        Response::success($course);
    }

    // POST /api/courses
    public function storeCourse($params, $input) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->courseModel->create([
            'title'           => $input['title'],
            'description'     => $input['description'] ?? '',
            'category'        => $input['category'] ?? 'general',
            'difficulty_level'=> $input['difficulty_level'] ?? 'beginner',
            'duration_hours'  => $input['duration_hours'] ?? null,
            'is_published'    => (bool)($input['is_published'] ?? false)
        ]);
        $course = $this->courseModel->findById($id);
        Response::success($course, 'Course created', 201);
    }

    // POST /api/lessons
    public function lessons($params, $input) {
        AuthMiddleware::handle();
        if (isset($input['course_id'])) {
            $lessons = $this->lessonModel->findWhere(
                'course_id = ?', [$input['course_id']], null, 0, 'order_index ASC'
            );
        } else {
            $lessons = $this->lessonModel->findAll(20, 0, 'created_at DESC');
        }
        Response::success($lessons);
    }
}