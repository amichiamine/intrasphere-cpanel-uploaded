<?php
/**
 * Modèle Event pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Event extends BaseModel {
    protected $table = 'events';

    public function getParticipants($eventId) {
        return $this->db->select(
            "SELECT ep.*, u.name FROM event_participants ep
             JOIN users u ON ep.user_id = u.id
             WHERE ep.event_id = ?
             ORDER BY ep.registered_at ASC",
            [$eventId]
        );
    }
}