<?php
/**
 * Modèle Announcement pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Announcement extends BaseModel {
    protected $table = 'announcements';

    public function getPublished($limit = null) {
        return $this->findWhere(
            'is_published = 1 AND (publish_at IS NULL OR publish_at <= NOW())',
            [],
            $limit,
            0,
            'publish_at DESC'
        );
    }
}