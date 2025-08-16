<?php
require_once __DIR__ . '/../Models/ForumCategory.php';
require_once __DIR__ . '/../Models/ForumTopic.php';
require_once __DIR__ . '/../Models/ForumPost.php';

class ForumController {
    private $catModel, $topicModel, $postModel;

    public function __construct() {
        $this->catModel   = new ForumCategory();
        $this->topicModel = new ForumTopic();
        $this->postModel  = new ForumPost();
    }

    public function categories($p,$i) {
        AuthMiddleware::handle();
        $cats = $this->catModel->getActive();
        Response::success($cats);
    }

    public function categoryDetails($p,$i) {
        AuthMiddleware::handle();
        $cat = $this->catModel->findById($p['id']);
        if (!$cat) Response::notFound('Category not found');
        Response::success($cat);
    }

    public function topics($p,$i) {
        AuthMiddleware::handle();
        $topics = $this->topicModel->findAll();
        Response::success($topics);
    }

    public function topicDetails($p,$i) {
        AuthMiddleware::handle();
        $topic = $this->topicModel->findById($p['id']);
        if (!$topic) Response::notFound('Topic not found');
        Response::success($topic);
    }

    public function storeCategory($p,$i) {
        AuthMiddleware::requireRole('moderator');
        $id = $this->catModel->create($i);
        $cat = $this->catModel->findById($id);
        Response::success($cat,'Created',201);
    }

    public function storeTopic($p,$i) {
        AuthMiddleware::handle();
        $id = $this->topicModel->create($i);
        $topic = $this->topicModel->findById($id);
        Response::success($topic,'Created',201);
    }

    public function topicPosts($p,$i) {
        AuthMiddleware::handle();
        $posts = $this->postModel->getByTopic($p['id']);
        Response::success($posts);
    }

    public function storePost($p,$i) {
        AuthMiddleware::handle();
        $id = $this->postModel->create($i);
        $post = $this->postModel->findById($id);
        Response::success($post,'Created',201);
    }
}