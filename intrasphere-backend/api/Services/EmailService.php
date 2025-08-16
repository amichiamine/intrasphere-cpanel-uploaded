<?php
/**
 * EmailService pour IntraSphere
 * Envoi d’emails via SMTP
 */

class EmailService {
    private $mailer;

    public function __construct() {
        // Configuration PHPMailer ou mail()
    }

    public function send($to, $subject, $body) {
        // Exemple basique avec mail()
        $headers  = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
        $headers .= 'From: ' . ($_ENV['MAIL_FROM_NAME'] ?? 'IntraSphere') .
                    ' <' . ($_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@domain.com') . '>' . "\r\n";
        return mail($to, $subject, $body, $headers);
    }
}