package services

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"onxzy/super-santa-server/database/models"
	"onxzy/super-santa-server/utils"
	"path/filepath"

	"go.uber.org/zap"
)

type MailService struct {
	config *utils.Config
	logger *zap.Logger
}

func NewMailService(config *utils.Config, logger *zap.Logger) *MailService {
	return &MailService{
		config: config,
		logger: logger.Named("mail-service"),
	}
}

type MailData struct {
	To      []string
	Subject string
	Data    map[string]any
}

func (s *MailService) sendMail(templateName string, mailData *MailData) error {
	if !s.config.Mail.Enabled {
		s.logger.Debug("Email sending is disabled in config, skipping",
			zap.String("template", templateName))
		return nil
	}

	// Load template
	templatePath := filepath.Join(s.config.Mail.TemplatesDir, templateName+".html")
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		s.logger.Error("Failed to parse email template", zap.String("template", templateName), zap.Error(err))
		return fmt.Errorf("failed to parse email template: %w", err)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, mailData.Data); err != nil {
		s.logger.Error("Failed to execute email template", zap.String("template", templateName), zap.Error(err))
		return fmt.Errorf("failed to execute email template: %w", err)
	}

	// Prepare email
	smtpConfig := s.config.Mail.SMTP
	auth := smtp.PlainAuth("", smtpConfig.Username, smtpConfig.Password, smtpConfig.Host)

	// Build the email
	headers := make(map[string]string)
	headers["From"] = smtpConfig.FromEmail
	headers["To"] = mailData.To[0] // For display purposes
	headers["Subject"] = mailData.Subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	var message bytes.Buffer
	for k, v := range headers {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n")
	message.Write(body.Bytes())

	// Send email
	addr := fmt.Sprintf("%s:%d", smtpConfig.Host, smtpConfig.Port)
	if err := smtp.SendMail(addr, auth, smtpConfig.FromEmail, mailData.To, message.Bytes()); err != nil {
		s.logger.Error("Failed to send email", zap.Strings("to", mailData.To), zap.Error(err))
		return fmt.Errorf("failed to send email: %w", err)
	}

	s.logger.Info("Email sent successfully", zap.Strings("to", mailData.To), zap.String("subject", mailData.Subject))
	return nil
}

// sendMailToUser is a helper function to send an email to a single user
func (s *MailService) sendMailToUser(templateName string, user models.User, subject string, data map[string]interface{}) {
	mailData := &MailData{
		To:      []string{user.Email},
		Subject: subject,
		Data:    data,
	}

	if err := s.sendMail(templateName, mailData); err != nil {
		s.logger.Error("Failed to send individual email",
			zap.String("template", templateName),
			zap.String("to", user.Email),
			zap.Error(err))
	}
}

func (s *MailService) SendDrawCompletionNotification(group *models.Group, users []models.User) error {
	// Send individual emails to each user using goroutines
	for _, user := range users {
		// Send in a goroutine to avoid waiting
		go s.sendMailToUser("draw_complete", user,
			"Secret Santa Draw Complete", map[string]any{
				"GroupName": group.Name,
				"GroupID":   group.ID,
				"AppURL":    s.config.Host.AppURL,
				"UserName":  user.Username, // Personalize with username
			})
	}

	s.logger.Info("Draw completion notification process started",
		zap.Int("userCount", len(users)),
		zap.String("groupName", group.Name))
	return nil
}

func (s *MailService) SendGroupCreationNotification(group *models.Group, admin *models.User) error {

	go s.sendMailToUser("group_created", *admin,
		fmt.Sprintf("Secret Santa Group '%s' Created", group.Name), map[string]any{
			"AdminName": admin.Username,
			"GroupName": group.Name,
			"GroupID":   group.ID,
			"AppURL":    s.config.Host.AppURL,
		})

	s.logger.Info("Group creation notification process started",
		zap.String("groupName", group.Name),
		zap.String("adminEmail", admin.Email))
	return nil
}

func (s *MailService) SendUserJoinedNotification(group *models.Group, newUser *models.User, admin *models.User) error {
	go s.sendMailToUser("group_created", *admin,
		fmt.Sprintf("New User Joined '%s'", group.Name), map[string]any{
			"AdminName": admin.Username,
			"UserName":  newUser.Username,
			"UserEmail": newUser.Email,
			"GroupName": group.Name,
			"GroupID":   group.ID,
			"AppURL":    s.config.Host.AppURL,
		})

	go s.sendMailToUser("user_joined_welcome", *newUser,
		fmt.Sprintf("Welcome to Secret Santa Group '%s'", group.Name), map[string]any{
			"UserName":  newUser.Username,
			"GroupName": group.Name,
			"GroupID":   group.ID,
			"AppURL":    s.config.Host.AppURL,
		})

	s.logger.Info("User joined notification process started",
		zap.String("groupName", group.Name),
		zap.String("newUserEmail", newUser.Email),
		zap.String("adminEmail", admin.Email))
	return nil
}
