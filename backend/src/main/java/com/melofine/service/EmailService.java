package com.melofine.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.name:Melo-Fine}")
    private String appName;

    /**
     * Sends 6-digit OTP verification email with clean headers to ensure Primary Inbox delivery.
     */
    public void sendOtpEmail(String recipientEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, appName);
            helper.setTo(recipientEmail);
            // Clean, professional subject line without spammy emojis
            helper.setSubject("Melo-Fine Verification Code: " + otpCode);

            String htmlBody = buildOtpEmailTemplate(otpCode);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info(">>> SUCCESS: OTP email dispatched successfully to: {} <<<", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", recipientEmail, e);
            throw new RuntimeException("Could not send verification email: " + e.getMessage());
        }
    }

    /**
     * Sends welcome greeting email asynchronously when an existing user signs in.
     */
    @Async
    public void sendWelcomeGreetingEmail(String recipientEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, appName);
            helper.setTo(recipientEmail);
            helper.setSubject("Welcome back to Melo-Fine, " + username + "!");

            String htmlBody = buildWelcomeGreetingTemplate(username);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info(">>> SUCCESS: Welcome back email dispatched to: {} <<<", recipientEmail);
        } catch (Exception e) {
            log.warn("Note: Failed to send welcome email to {}: {}", recipientEmail, e.getMessage());
        }
    }

    private String buildOtpEmailTemplate(String otp) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0908; color: #e8ddd4; margin: 0; padding: 24px; }
            .card { max-width: 480px; margin: 0 auto; background: #141110; border: 1px solid #2b231f; border-radius: 20px; padding: 36px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); }
            .brand { font-size: 20px; font-weight: 800; color: #f5a77f; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
            .title { font-size: 22px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 10px; }
            .desc { font-size: 14px; color: #9e9188; text-align: center; line-height: 1.5; margin-bottom: 28px; }
            .otp-box { text-align: center; background: rgba(245, 167, 127, 0.08); border: 1.5px dashed #f5a77f; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #f5a77f; font-family: 'Courier New', monospace; }
            .expire { font-size: 12px; color: #80736b; text-align: center; margin-top: 20px; }
            .footer { text-align: center; font-size: 11px; color: #524741; margin-top: 30px; border-top: 1px solid #241d1a; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">&#10022; MELO-FINE</div>
            <div class="title">Verify Your Account</div>
            <p class="desc">Enter the 6-digit code below to complete your registration and step into your music sanctuary.</p>
            <div class="otp-box">
              <div class="otp-code">%s</div>
            </div>
            <p class="expire">This code expires in <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
            <div class="footer">&copy; 2026 Melo-Fine Music. Pure Audio, Elevated.</div>
          </div>
        </body>
        </html>
        """.formatted(otp);
    }

    private String buildWelcomeGreetingTemplate(String username) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0908; color: #e8ddd4; margin: 0; padding: 24px; }
            .card { max-width: 480px; margin: 0 auto; background: #141110; border: 1px solid #2b231f; border-radius: 20px; padding: 36px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); }
            .brand { font-size: 20px; font-weight: 800; color: #f5a77f; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
            .title { font-size: 22px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 10px; }
            .desc { font-size: 14px; color: #9e9188; text-align: center; line-height: 1.6; margin-bottom: 24px; }
            .highlight { background: rgba(245, 167, 127, 0.08); border-left: 3px solid #f5a77f; padding: 12px 18px; border-radius: 8px; font-size: 13px; color: #e8ddd4; }
            .footer { text-align: center; font-size: 11px; color: #524741; margin-top: 30px; border-top: 1px solid #241d1a; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">&#10022; MELO-FINE</div>
            <div class="title">Welcome Back, %s!</div>
            <p class="desc">You have successfully signed in to Melo-Fine. Your personalized music streams, favorites, and playlists are synced and ready.</p>
            <div class="highlight">
              Discover and stream any track with high-fidelity sound on your dashboard.
            </div>
            <div class="footer">&copy; 2026 Melo-Fine Music Player. Crafted for audiophiles.</div>
          </div>
        </body>
        </html>
        """.formatted(username);
    }
}
