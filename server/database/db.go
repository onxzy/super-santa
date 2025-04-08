package database

import (
	"context"
	"onxzy/super-santa-server/utils"

	"go.uber.org/fx"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/zapgorm2"
)

type DB struct {
	gorm *gorm.DB
}

func NewDB(lc fx.Lifecycle, log *zap.Logger, config *utils.Config) *DB {

	logger := zapgorm2.New(log.Named("gorm"))

	db, err := gorm.Open(sqlite.Open(config.DB.SQLitePath), &gorm.Config{
		Logger: logger,
	})
	if err != nil {
		return nil
	}

	lc.Append(fx.Hook{
		OnStop: func(ctx context.Context) error {
			sqlDB, err := db.DB()
			if err != nil {
				return err
			}
			return sqlDB.Close()
		},
	})

	return &DB{gorm: db}
}
