<?php
require_once __DIR__ . '/BaseModel.php';

class ViewsConfig extends BaseModel {
    protected $table = 'views_config';

    public function getViewsConfig() {
        $rows = $this->findWhere('is_active=1',[]);
        $out = [];
        foreach($rows as $r) {
            $out[$r['view_id']] = json_decode($r['config_data'],true);
        }
        return $out;
    }

    public function saveViewsConfig($views) {
        $this->db->beginTransaction();
        $this->db->execute("DELETE FROM {$this->table}");
        foreach($views as $vid=>$cfg) {
            $this->create(['view_id'=>$vid,'config_data'=>json_encode($cfg)]);
        }
        $this->db->commit();
        return true;
    }

    public function updateViewConfig($viewId,$cfg) {
        $rows = $this->findWhere('view_id=?',[$viewId]);
        if ($rows) {
            $this->update($rows[0]['id'],['config_data'=>json_encode($cfg)]);
        } else {
            $this->create(['view_id'=>$viewId,'config_data'=>json_encode($cfg)]);
        }
    }
}