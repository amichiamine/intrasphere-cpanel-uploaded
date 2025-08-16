<?php
/**
 * Modèle Document pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Document extends BaseModel {
    protected $table = 'documents';

    public function incrementViews($id) {
        return $this->db->execute(
            "UPDATE {$this->table} SET view_count = view_count + 1 WHERE id = ?",
            [$id]
        );
    }

    public function getByCategory($categoryId) {
        return $this->findWhere(
            'category_id = ?',
            [$categoryId],
            null,
            0,
            'created_at DESC'
        );
    }
}