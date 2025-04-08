package main

import (
	"context"
	"net"
	"net/http"
	"onxzy/super-santa-server/controllers"
	"onxzy/super-santa-server/database"
	"onxzy/super-santa-server/middlewares"
	"onxzy/super-santa-server/services"
	"onxzy/super-santa-server/utils"
	"time"

	"github.com/gin-contrib/cors"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.uber.org/fx"
	"go.uber.org/fx/fxevent"
	"go.uber.org/zap"
)

func main() {
	app := fx.New(
		fx.Provide(
			utils.InitZap,
			utils.InitConfig,
			database.NewDB,
			database.NewGroupStore,
			database.NewUserStore,
			services.NewGroupService,
			services.NewUserService,
			services.NewAuthService,
			controllers.NewAuthController,
			controllers.NewGroupController,
			middlewares.NewAuthMiddleware,
			validator.New,
			server,
		),
		fx.WithLogger(func(log *zap.Logger) fxevent.Logger {
			return &fxevent.ZapLogger{Logger: log.Named("fx")}
		}),
		fx.Invoke(func(*gin.Engine) {}),
	)
	app.Run()
}

func server(
	lc fx.Lifecycle,
	config *utils.Config,
	authController *controllers.AuthController,
	authMiddleware *middlewares.AuthMiddleware,
	groupController *controllers.GroupController,
	log *zap.Logger,
) *gin.Engine {

	log = log.Named("gin")

	router := gin.New()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = config.Cors.AllowOrigins
	corsConfig.AddAllowHeaders("Authorization")

	router.Use(cors.New(corsConfig))

	router.Use(ginzap.Ginzap(log, time.RFC3339, true))
	router.Use(ginzap.RecoveryWithZap(log, true))

	apiRouter := router.Group("/api/v1")
	authController.RegisterRoutes(apiRouter.Group("/auth"), authMiddleware)
	groupController.RegisterRoutes(apiRouter.Group("/group"), authMiddleware)

	srv := &http.Server{Addr: ":8080", Handler: router} // define a web server

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			ln, err := net.Listen("tcp", srv.Addr) // the web server starts listening on 8080
			if err != nil {
				log.Error("failed to start HTTP server", zap.String("addr", srv.Addr))
				return err
			}
			go srv.Serve(ln) // process an incoming request in a go routine
			log.Info("HTTP server started", zap.String("addr", srv.Addr))
			return nil

		},
		OnStop: func(ctx context.Context) error {
			srv.Shutdown(ctx) // stop the web server
			log.Info("HTTP server is stopped")
			return nil
		},
	})

	return router
}
