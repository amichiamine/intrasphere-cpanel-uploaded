<?php
/**
 * Contrôleur Analytics pour IntraSphere
 */

class AnalyticsController {

    public function overview($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $userModel         = new User();
        $announcementModel = new Announcement();
        $documentModel     = new Document();
        $stats = [
            'total_users'        => $userModel->count(),
            'active_users'       => $userModel->count('is_active=1'),
            'total_announcements'=> $announcementModel->count(),
            'total_documents'    => $documentModel->count(),
            'timestamp'          => time()
        ];
        Response::success($stats);
    }

    public function users($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $model = new User();
        $stats = [
            'by_role' => $model->getUserStatsByRole(),
            'new_this_month'=> $model->count('created_at >= DATE_SUB(NOW(),INTERVAL 30 DAY)')
        ];
        Response::success($stats);
    }

    public function content($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $ann = new Announcement();
        $doc = new Document();
        $cnt = new Content();
        $stats = [
            'announcements'=> ['total'=>$ann->count()],
            'documents'=> ['total'=>$doc->count()],
            'pages'=> ['total'=>$cnt->count()]
        ];
        Response::success($stats);
    }

    public function forum($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $cat = new ForumCategory();
        $top = new ForumTopic();
        $ps  = new ForumPost();
        $stats = [
            'categories'=> $cat->count(),
            'topics'    => $top->count(),
            'posts'     => $ps->count()
        ];
        Response::success($stats);
    }

    public function training($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $tr = new Training();
        $co = new Course();
        $stats = [
            'trainings'=> $tr->count(),
            'courses'  => $co->count()
        ];
        Response::success($stats);
    }

    public function system($p,$i) {
        AuthMiddleware::requireRole('admin');
        $ss = new SystemSettings();
        $settings = $ss->getAll();
        Response::success($settings);
    }
}