<?php
/**
 * Modèle SystemSettings pour IntraSphere
 */

require_once __DIR__ . '/BaseModel.php';

class SystemSettings extends BaseModel {
    protected $table = 'system_settings';

    public function getAll() {
        $rows = $this->findAll();
        $conf = [];
        foreach ($rows as $row) {
            $conf[$row['key']] = json_decode($row['value'], true) ?? $row['value'];
        }
        return $conf;
    }

    public function updateSetting($key, $value) {
        $json = is_array($value) ? json_encode($value) : $value;
        $existing = $this->db->selectOne(
            "SELECT id FROM {$this->table} WHERE `key` = ?",
            [$key]
        );
        if ($existing) {
            return $this->update($existing['id'], ['value'=>$json]);
        }
        return $this->create(['key'=>$key,'value'=>$json]);
    }
}