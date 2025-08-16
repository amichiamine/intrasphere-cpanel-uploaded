<?php
/**
 * Modèle ForumCategory pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class ForumCategory extends BaseModel {
    protected $table = 'forum_categories';

    public function getActive() {
        return $this->findWhere('is_active = 1', [], null, 0, 'sort_order ASC');
    }
}