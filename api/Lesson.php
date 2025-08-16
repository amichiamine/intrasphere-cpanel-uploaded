<?php
require_once __DIR__ . '/BaseModel.php';

class Lesson extends BaseModel {
    protected $table = 'lessons';

    public function getByCourse($courseId) {
        return $this->findWhere(
            'course_id = ?',
            [$courseId],
            null,
            0,
            'order_index ASC'
        );
    }
}