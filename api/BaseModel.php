<?php
/**
 * BaseModel pour IntraSphere
 * Classe de base pour tous les modèles
 */

class BaseModel {
    protected $db;
    protected $table;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    protected function generateUniqueId() {
        return uniqid('', true);
    }

    public function findAll($limit = null, $offset = 0, $orderBy = 'created_at DESC') {
        $query = "SELECT * FROM {$this->table}";
        if ($orderBy) {
            $query .= " ORDER BY {$orderBy}";
        }
        if ($limit) {
            $query .= " LIMIT {$limit}";
            if ($offset) {
                $query .= " OFFSET {$offset}";
            }
        }
        return $this->db->select($query);
    }

    public function findById($id) {
        return $this->db->selectOne(
            "SELECT * FROM {$this->table} WHERE id = ?",
            [$id]
        );
    }

    public function findWhere($conditions, $params = [], $limit = null, $offset = 0, $orderBy = null) {
        $query = "SELECT * FROM {$this->table} WHERE {$conditions}";
        if ($orderBy) {
            $query .= " ORDER BY {$orderBy}";
        }
        if ($limit) {
            $query .= " LIMIT {$limit}";
            if ($offset) {
                $query .= " OFFSET {$offset}";
            }
        }
        return $this->db->select($query, $params);
    }

    public function create($data) {
        $data['id'] = $data['id'] ?? $this->generateUniqueId();
        $data['created_at'] = $data['created_at'] ?? date('Y-m-d H:i:s');

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');

        $query = "INSERT INTO {$this->table} (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ")";
        $this->db->execute($query, array_values($data));
        return $data['id'];
    }

    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $fields = array_keys($data);
        $setClause = implode(' = ?, ', $fields) . ' = ?';

        $query = "UPDATE {$this->table} SET {$setClause} WHERE id = ?";
        $params = array_values($data);
        $params[] = $id;
        return $this->db->execute($query, $params);
    }

    public function delete($id) {
        return $this->db->execute(
            "DELETE FROM {$this->table} WHERE id = ?",
            [$id]
        );
    }

    public function count($conditions = '1 = 1', $params = []) {
        $result = $this->db->selectOne(
            "SELECT COUNT(*) as count FROM {$this->table} WHERE {$conditions}",
            $params
        );
        return $result['count'];
    }

    public function paginate($page = 1, $limit = 20, $conditions = '1 = 1', $params = [], $orderBy = 'created_at DESC') {
        $offset = ($page - 1) * $limit;
        $items = $this->findWhere($conditions, $params, $limit, $offset, $orderBy);
        $total = $this->count($conditions, $params);

        return [
            'items' => $items,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_items' => $total,
                'items_per_page' => $limit
            ]
        ];
    }
}