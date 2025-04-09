package utils

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type Config struct {
	v *viper.Viper

	Host struct {
		AppURL string `mapstructure:"app_url"`
		ApiURL string `mapstructure:"api_url"`
		Listen string `mapstructure:"listen"`
		Port   string `mapstructure:"port"`
	} `mapstructure:"host"`

	Cors struct {
		AllowOrigins []string `mapstructure:"allow_origins"`
	} `mapstructure:"cors"`

	Auth struct {
		JWT struct {
			Secret      string `mapstructure:"secret"`
			AuthExpire  int    `mapstructure:"expire"`
			GroupExpire int    `mapstructure:"expire_group"`
		} `mapstructure:"jwt"`
	}

	Log struct {
		Level string `mapstructure:"level"`
	} `mapstructure:"log"`

	DB struct {
		SQLitePath string `mapstructure:"sqlitepath"`
	} `mapstructure:"db"`

	Mail struct {
		SMTP struct {
			Host      string `mapstructure:"host"`
			Port      int    `mapstructure:"port"`
			Username  string `mapstructure:"username"`
			Password  string `mapstructure:"password"`
			FromEmail string `mapstructure:"from_email"`
		} `mapstructure:"smtp"`
		Enabled      bool   `mapstructure:"enabled"`
		TemplatesDir string `mapstructure:"templates_dir"`
	} `mapstructure:"mail"`
}

func InitConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		zap.L().Info("No .env file found or error loading it. Using environment variables.", zap.Error(err))
	}

	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")

	// Set defaults for config values
	v.SetDefault("host.app_url", "http://localhost:8080")
	v.SetDefault("host.api_url", "http://localhost:8080/api/v1")
	v.SetDefault("host.listen", "0.0.0.0")
	v.SetDefault("host.port", "8080")
	v.SetDefault("auth.jwt.secret", "")
	v.SetDefault("auth.jwt.expire", 3600)
	v.SetDefault("auth.jwt.expire_group", 3600)
	v.SetDefault("cors.allow_origins", []string{"*"})
	v.SetDefault("log.level", "info")
	v.SetDefault("db.sqlitepath", "data.db")
	v.SetDefault("mail.enabled", false)
	v.SetDefault("mail.templates_dir", "./templates/emails")
	v.SetDefault("mail.smtp.host", "")
	v.SetDefault("mail.smtp.port", 587)
	v.SetDefault("mail.smtp.username", "")
	v.SetDefault("mail.smtp.password", "")
	v.SetDefault("mail.smtp.from_email", "")

	// Configure environment variables
	v.SetEnvPrefix("SSS") // Secret Santa Server
	v.AutomaticEnv()      // Read in environment variables that match
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := v.ReadInConfig(); err != nil {
		zap.L().Fatal("Error reading config file", zap.Error(err))
	}

	zap.L().Info("Loading config file", zap.String("file", v.ConfigFileUsed()))

	config := Config{v: v}
	if err := v.Unmarshal(&config); err != nil {
		zap.L().Fatal("Unable to decode into struct", zap.Error(err))
	}

	// Load sensitive configuration
	// loadSensitiveConfigFromViper(&config, v)
	v.Debug()

	// Log the loaded configuration using json
	configJSON, _ := json.MarshalIndent(config, "", "  ")
	fmt.Println(string(configJSON))

	return &config
}
