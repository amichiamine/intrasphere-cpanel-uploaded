<?php
/**
 * Modèle ForumTopic pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class ForumTopic extends BaseModel {
    protected $table = 'forum_topics';

    public function getPosts($topicId) {
        return $this->db->select(
            "SELECT * FROM forum_posts WHERE topic_id = ? ORDER BY created_at ASC",
            [$topicId]
        );
    }
}