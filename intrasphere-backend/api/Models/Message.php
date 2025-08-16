<?php
/**
 * Modèle Message pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class Message extends BaseModel {
    protected $table = 'messages';

    public function getReceived($userId) {
        return $this->findWhere(
            'recipient_id = ?',
            [$userId],
            null,
            0,
            'created_at DESC'
        );
    }

    public function getSent($userId) {
        return $this->findWhere(
            'sender_id = ?',
            [$userId],
            null,
            0,
            'created_at DESC'
        );
    }
}