package utils

import (
	"context"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func InitZap(lc fx.Lifecycle, config *Config) *zap.Logger {
	zapConfig := zap.NewDevelopmentConfig()

	level, err := zapcore.ParseLevel(config.Log.Level)
	if err != nil {
		zap.L().Fatal("Invalid log level", zap.Error(err))
	}
	zapConfig.Level = zap.NewAtomicLevelAt(level)

	// Add color to the logs
	zapConfig.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder

	// Make time field shorter
	zapConfig.EncoderConfig.EncodeTime = zapcore.TimeEncoderOfLayout("15:04:05")

	logger, err := zapConfig.Build()
	if err != nil {
		zap.L().Fatal("Can't initialize zap logger", zap.Error(err))
	}

	lc.Append(fx.Hook{
		OnStop: func(ctx context.Context) error {
			return logger.Sync()
		},
	})

	return logger
}
