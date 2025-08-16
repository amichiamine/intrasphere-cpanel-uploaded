<?php
require_once __DIR__ . '/BaseModel.php';

class ForumPost extends BaseModel {
    protected $table = 'forum_posts';

    public function getByTopic($topicId) {
        return $this->findWhere('topic_id = ?', [$topicId], null, 0, 'created_at ASC');
    }
}