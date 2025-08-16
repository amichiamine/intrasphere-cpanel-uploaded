<?php
require_once __DIR__ . '/BaseModel.php';

class Training extends BaseModel {
    protected $table = 'trainings';

    public function getParticipants($trainingId) {
        return $this->db->select(
            "SELECT tp.*, u.name FROM training_participants tp
             JOIN users u ON tp.user_id=u.id
             WHERE tp.training_id=?",
            [$trainingId]
        );
    }

    public function addParticipant($trainingId,$userId) {
        return $this->db->insert(
            "INSERT INTO training_participants (id,training_id,user_id,registered_at)
             VALUES (?,?,?,NOW())",
            [$this->generateUniqueId(),$trainingId,$userId]
        );
    }
}