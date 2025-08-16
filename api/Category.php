<?php
/**
 * Modèle Category pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Category extends BaseModel {
    protected $table = 'categories';

    public function getActive() {
        return $this->findWhere(
            'is_active = 1',
            [],
            null,
            0,
            'sort_order ASC'
        );
    }
}