"use strict";
/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerRouter = void 0;
const express_1 = require("express");
const AuthenticationRouter_1 = require("./AuthenticationRouter");
const ApplicationRouter_1 = require("./ApplicationRouter");
const NotificationRouter_1 = require("./NotificationRouter");
const PluginService_1 = require("../../../../server/services/PluginService");
const AgentPortalExtensions_1 = require("../extensions/AgentPortalExtensions");
const LoggingService_1 = require("../../../../server/services/LoggingService");
class ServerRouter {
    constructor(application) {
        this.expressRouter = express_1.Router();
        application.use(this.expressRouter);
    }
    initializeRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initExtensions();
            //this.expressRouter.use(AuthenticationRouter_1.AuthenticationRouter.getInstance().getBaseRoute(), AuthenticationRouter_1.AuthenticationRouter.getInstance().getRouter());
            //this.expressRouter.use(ApplicationRouter_1.ApplicationRouter.getInstance().getBaseRoute(), ApplicationRouter_1.ApplicationRouter.getInstance().getRouter());
            this.expressRouter.use(NotificationRouter_1.NotificationRouter.getInstance().getBaseRoute(), NotificationRouter_1.NotificationRouter.getInstance().getRouter());
        });
    }
    initExtensions() {
        return __awaiter(this, void 0, void 0, function* () {
            const routerExtensions = yield PluginService_1.PluginService.getInstance().getExtensions(AgentPortalExtensions_1.AgentPortalExtensions.ROUTER);
            LoggingService_1.LoggingService.getInstance().info(`Init ${routerExtensions.length} router extensions`);
            for (const extension of routerExtensions) {
                yield extension.registerRouter(this.expressRouter);
            }
        });
    }
}
exports.ServerRouter = ServerRouter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mcm9udGVuZC1hcHBsaWNhdGlvbnMvYWdlbnQtcG9ydGFsL3NlcnZlci9yb3V0ZXMvU2VydmVyUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztHQU9HOzs7Ozs7Ozs7Ozs7QUFFSCxxQ0FBOEM7QUFDOUMsaUVBQThEO0FBQzlELDJEQUF3RDtBQUN4RCw2REFBMEQ7QUFDMUQsNkVBQTBFO0FBQzFFLCtFQUE0RTtBQUU1RSwrRUFBNEU7QUFFNUUsTUFBYSxZQUFZO0lBSXJCLFlBQW1CLFdBQXdCO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsZ0JBQU0sRUFBRSxDQUFDO1FBRTlCLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFWSxnQkFBZ0I7O1lBQ3pCLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRTVCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNsQiwyQ0FBb0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxZQUFZLEVBQUUsRUFBRSwyQ0FBb0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FDcEcsQ0FBQztZQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNsQixxQ0FBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxxQ0FBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FDOUYsQ0FBQztZQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNsQix1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxZQUFZLEVBQUUsRUFBRSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FDaEcsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVhLGNBQWM7O1lBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLGFBQWEsQ0FDcEUsNkNBQXFCLENBQUMsTUFBTSxDQUMvQixDQUFDO1lBRUYsK0JBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxnQkFBZ0IsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLENBQUM7WUFDdkYsS0FBSyxNQUFNLFNBQVMsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDdEMsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN0RDtRQUNMLENBQUM7S0FBQTtDQUNKO0FBcENELG9DQW9DQyIsImZpbGUiOiJmcm9udGVuZC1hcHBsaWNhdGlvbnMvYWdlbnQtcG9ydGFsL3NlcnZlci9yb3V0ZXMvU2VydmVyUm91dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtMjAyMyBjLmEucC5lLiBJVCBHbWJILCBodHRwczovL3d3dy5jYXBlLWl0LmRlXG4gKiAtLVxuICogVGhpcyBzb2Z0d2FyZSBjb21lcyB3aXRoIEFCU09MVVRFTFkgTk8gV0FSUkFOVFkuIEZvciBkZXRhaWxzLCBzZWVcbiAqIHRoZSBlbmNsb3NlZCBmaWxlIExJQ0VOU0UgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24gKEdQTDMpLiBJZiB5b3VcbiAqIGRpZCBub3QgcmVjZWl2ZSB0aGlzIGZpbGUsIHNlZSBodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC0zLjAudHh0LlxuICogLS1cbiAqL1xuXG5pbXBvcnQgeyBBcHBsaWNhdGlvbiwgUm91dGVyIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBBdXRoZW50aWNhdGlvblJvdXRlciB9IGZyb20gJy4vQXV0aGVudGljYXRpb25Sb3V0ZXInO1xuaW1wb3J0IHsgQXBwbGljYXRpb25Sb3V0ZXIgfSBmcm9tICcuL0FwcGxpY2F0aW9uUm91dGVyJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvblJvdXRlciB9IGZyb20gJy4vTm90aWZpY2F0aW9uUm91dGVyJztcbmltcG9ydCB7IFBsdWdpblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvc2VydmljZXMvUGx1Z2luU2VydmljZSc7XG5pbXBvcnQgeyBBZ2VudFBvcnRhbEV4dGVuc2lvbnMgfSBmcm9tICcuLi9leHRlbnNpb25zL0FnZW50UG9ydGFsRXh0ZW5zaW9ucyc7XG5pbXBvcnQgeyBJU2VydmVyUm91dGVyRXh0ZW5zaW9uIH0gZnJvbSAnLi4vZXh0ZW5zaW9ucy9JU2VydmVyUm91dGVyRXh0ZW5zaW9uJztcbmltcG9ydCB7IExvZ2dpbmdTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL3NlcnZpY2VzL0xvZ2dpbmdTZXJ2aWNlJztcblxuZXhwb3J0IGNsYXNzIFNlcnZlclJvdXRlciB7XG5cbiAgICBwcml2YXRlIGV4cHJlc3NSb3V0ZXI6IFJvdXRlcjtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pIHtcbiAgICAgICAgdGhpcy5leHByZXNzUm91dGVyID0gUm91dGVyKCk7XG5cbiAgICAgICAgYXBwbGljYXRpb24udXNlKHRoaXMuZXhwcmVzc1JvdXRlcik7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGluaXRpYWxpemVSb3V0ZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdEV4dGVuc2lvbnMoKTtcblxuICAgICAgICB0aGlzLmV4cHJlc3NSb3V0ZXIudXNlKFxuICAgICAgICAgICAgQXV0aGVudGljYXRpb25Sb3V0ZXIuZ2V0SW5zdGFuY2UoKS5nZXRCYXNlUm91dGUoKSwgQXV0aGVudGljYXRpb25Sb3V0ZXIuZ2V0SW5zdGFuY2UoKS5nZXRSb3V0ZXIoKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzc1JvdXRlci51c2UoXG4gICAgICAgICAgICBBcHBsaWNhdGlvblJvdXRlci5nZXRJbnN0YW5jZSgpLmdldEJhc2VSb3V0ZSgpLCBBcHBsaWNhdGlvblJvdXRlci5nZXRJbnN0YW5jZSgpLmdldFJvdXRlcigpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5leHByZXNzUm91dGVyLnVzZShcbiAgICAgICAgICAgIE5vdGlmaWNhdGlvblJvdXRlci5nZXRJbnN0YW5jZSgpLmdldEJhc2VSb3V0ZSgpLCBOb3RpZmljYXRpb25Sb3V0ZXIuZ2V0SW5zdGFuY2UoKS5nZXRSb3V0ZXIoKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW5pdEV4dGVuc2lvbnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHJvdXRlckV4dGVuc2lvbnMgPSBhd2FpdCBQbHVnaW5TZXJ2aWNlLmdldEluc3RhbmNlKCkuZ2V0RXh0ZW5zaW9uczxJU2VydmVyUm91dGVyRXh0ZW5zaW9uPihcbiAgICAgICAgICAgIEFnZW50UG9ydGFsRXh0ZW5zaW9ucy5ST1VURVJcbiAgICAgICAgKTtcblxuICAgICAgICBMb2dnaW5nU2VydmljZS5nZXRJbnN0YW5jZSgpLmluZm8oYEluaXQgJHtyb3V0ZXJFeHRlbnNpb25zLmxlbmd0aH0gcm91dGVyIGV4dGVuc2lvbnNgKTtcbiAgICAgICAgZm9yIChjb25zdCBleHRlbnNpb24gb2Ygcm91dGVyRXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgYXdhaXQgZXh0ZW5zaW9uLnJlZ2lzdGVyUm91dGVyKHRoaXMuZXhwcmVzc1JvdXRlcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uLy4uIn0=
