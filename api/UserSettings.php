<?php
/**
 * Modèle UserSettings pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class UserSettings extends BaseModel {
    protected $table = 'user_settings';

    public function getUserSettings($userId) {
        $rows = $this->findWhere('user_id = ?', [$userId]);
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['key']] = json_decode($row['value'], true) ?? $row['value'];
        }
        return $settings;
    }

    public function updateSetting($userId, $key, $value) {
        $json = is_array($value) ? json_encode($value) : $value;
        $existing = $this->db->selectOne(
            "SELECT id FROM {$this->table} WHERE user_id = ? AND `key` = ?",
            [$userId, $key]
        );
        if ($existing) {
            return $this->update($existing['id'], ['value'=>$json]);
        }
        return $this->create(['user_id'=>$userId,'key'=>$key,'value'=>$json]);
    }
}