package me.xyzo.blackwatchBE.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Blackwatch 인증 코드");
        message.setText("인증 코드: " + code + "\n\n이 코드는 10분간 유효합니다.");

        mailSender.send(message);
    }
}