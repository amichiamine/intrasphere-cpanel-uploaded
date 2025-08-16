<?php
/**
 * Modèle Content pour IntraSphere (CMS/Page Builder)
 */

require_once __DIR__ . '/BaseModel.php';

class Content extends BaseModel {
    protected $table = 'contents';

    public function findBySlug($slug) {
        return $this->db->selectOne(
            "SELECT * FROM {$this->table} WHERE slug = ?",
            [$slug]
        );
    }

    public function incrementViews($id) {
        return $this->db->execute(
            "UPDATE {$this->table} SET view_count = view_count + 1 WHERE id = ?",
            [$id]
        );
    }
}