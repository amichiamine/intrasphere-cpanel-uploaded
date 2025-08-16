<?php
require_once __DIR__ . '/BaseModel.php';

class Course extends BaseModel {
    protected $table = 'courses';

    public function getPublished() {
        return $this->findWhere('is_published = 1', [], null, 0, 'created_at DESC');
    }

    public function isUserEnrolled($courseId, $userId) {
        $r = $this->db->selectOne(
            'SELECT COUNT(*) as c FROM course_enrollments WHERE course_id = ? AND user_id = ?',
            [$courseId, $userId]
        );
        return $r['c'] > 0;
    }
}