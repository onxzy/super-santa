package utils

import (
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type Config struct {
	v *viper.Viper

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
}

func InitConfig() *Config {
	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")

	v.SetEnvPrefix("SSS") // Secret Santa Server
	v.AutomaticEnv()

	v.SetDefault("log.level", "info")
	v.SetDefault("db.sqlitepath", "server.db")

	if err := v.ReadInConfig(); err != nil {
		zap.L().Fatal("Error reading config file", zap.Error(err))
	}

	zap.L().Info("Loading config file", zap.String("file", v.ConfigFileUsed()))

	config := Config{v: v}
	if err := v.Unmarshal(&config); err != nil {
		zap.L().Fatal("Unable to decode into struct", zap.Error(err))
	}

	v.Debug()

	return &config
}
