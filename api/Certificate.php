<?php
/**
 * Modèle Certificate pour IntraSphere E-Learning
 */

require_once __DIR__ . '/BaseModel.php';

class Certificate extends BaseModel {
    protected $table = 'certificates';

    public function getUserCertificates($userId) {
        return $this->findWhere('user_id = ?', [$userId], null, 0, 'earned_at DESC');
    }

    public function generate($userId, $courseId, $courseName) {
        $num = 'CERT-' . strtoupper(substr(md5(uniqid()),0,8));
        return $this->create([
            'user_id'=>$userId,
            'course_id'=>$courseId,
            'course_name'=>$courseName,
            'certificate_number'=>$num,
            'earned_at'=>date('Y-m-d H:i:s')
        ]);
    }
}