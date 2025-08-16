<?php
require_once __DIR__ . '/BaseModel.php';

class Resource extends BaseModel {
    protected $table = 'resources';

    public function incrementDownloads($id) {
        return $this->db->execute(
            "UPDATE {$this->table} SET download_count = download_count + 1 WHERE id = ?",
            [$id]
        );
    }
}