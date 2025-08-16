<?php
/**
 * Modèle Complaint pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Complaint extends BaseModel {
    protected $table = 'complaints';

    public function assignTo($id, $assignedToId) {
        return $this->update($id, ['assigned_to_id' => $assignedToId]);
    }

    public function changeStatus($id, $status) {
        return $this->update($id, ['status' => $status]);
    }
}