"use strict";
/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSPRouter = void 0;
const path_1 = __importDefault(require("path"));
const KIXRouter_1 = require("../../../../frontend-applications/agent-portal/server/routes/KIXRouter");
const AgentPortalExtensions_1 = require("../../../../frontend-applications/agent-portal/server/extensions/AgentPortalExtensions");
const PluginService_1 = require("../../../../server/services/PluginService");
const UserType_1 = require("../../../../frontend-applications/agent-portal/modules/user/model/UserType");
const LoggingService_1 = require("../../../../server/services/LoggingService");
const AuthenticationService_1 = require("./AuthenticationService");
const AuthenticationService_2 = require("../../../../server/services/AuthenticationService");
class SSPRouter extends KIXRouter_1.KIXRouter {
    constructor() {
        super();
    }
    static getInstance() {
        if (!SSPRouter.INSTANCE) {
            SSPRouter.INSTANCE = new SSPRouter();
        }
        return SSPRouter.INSTANCE;
    }
    getBaseRoute() {
        return '/';
    }
    initialize() {
        this.router.get('/', AuthenticationService_1.AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService_1.AuthenticationService.getInstance()), this.getSSPApplication.bind(this));
        this.router.get('/:moduleId', AuthenticationService_1.AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService_1.AuthenticationService.getInstance()), this.getSSPApplication.bind(this));
        this.router.get('/:moduleId/:objectId', AuthenticationService_1.AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService_1.AuthenticationService.getInstance()), this.getSSPApplication.bind(this));
        this.router.get('/:moduleId/:objectId/*', AuthenticationService_1.AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService_1.AuthenticationService.getInstance()), this.getSSPApplication.bind(this));
    }
    getSSPApplication(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join('..', 'webapp', 'ssp-application');
            const template = require(templatePath).default;
            let modules = yield PluginService_1.PluginService.getInstance().getExtensions(AgentPortalExtensions_1.AgentPortalExtensions.MODULES);
            modules = modules.filter((m) => !m.applications.length || m.applications.some((a) => a === 'SSP'));
            res.marko(template, { modules });
        });
    }
    getSSPLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ssoEnabled = process.env.SSO_ENABLED_SSP === 'true';
            if (ssoEnabled) {
                if (!req.cookies.authNegotiationDone && !req.cookies.authNoSSO) {
                    res.cookie('authNegotiationDone', true, { httpOnly: true });
                    res.setHeader('WWW-Authenticate', 'Negotiate');
                    res.status(401);
                    res.send(`<!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <title>KIX Agent Portal</title>
                            <meta http-equiv="refresh" content="3; URL=/">
                        </head>
                        <body></body>
                    </html>`);
                }
                else {
                    let authType = '';
                    let negotiationToken = '';
                    const authorization = req.headers['authorization'];
                    if (typeof authorization === 'string' && authorization.split(' ')[0] === 'Negotiate') {
                        // already negotiated (SSO)
                        negotiationToken = authorization.split(' ')[1];
                        authType = 'negotiate token (SSO)';
                    }
                    let user = '';
                    if (req.headers['x-kix-user'] && typeof req.headers['x-kix-user'] === 'string') {
                        // login with trusted header
                        user = req.headers['x-kix-user'];
                        authType = 'trusted HTTP header';
                    }
                    let success = true;
                    const token = yield AuthenticationService_2.AuthenticationService.getInstance().login(user, null, UserType_1.UserType.CUSTOMER, negotiationToken, null, null, false).catch((e) => {
                        LoggingService_1.LoggingService.getInstance().error('Error when trying to login with ' + authType);
                        success = false;
                    });
                    if (success) {
                        res.cookie('ssp-token', token);
                        res.clearCookie('authNegotiationDone');
                        res.status(200);
                        res.send(`<!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <title>KIX Agent Portal</title>
                                <meta http-equiv="refresh" content="3; URL=/">
                            </head>
                            <body></body>
                        </html>`);
                    }
                }
            }
            this.routeToLoginPage(req, res);
        });
    }
    routeToLoginPage(req, res) {
        res.clearCookie('ssp-token');
        res.clearCookie('authNegotiationDone');
        res.cookie('authNoSSO', true, { httpOnly: true });
        const templatePath = path_1.default.join('..', 'webapp', 'ssp-login');
        const template = require(templatePath).default;
        const redirectUrl = `${this.getBaseRoute()}${req.url}`;
        res.marko(template, { redirectUrl });
    }
}
exports.SSPRouter = SSPRouter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5zL1NTUC9zZWxmLXNlcnZpY2UtcG9ydGFsL3NlcnZlci9TU1BSb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7O0dBT0c7Ozs7Ozs7Ozs7Ozs7OztBQUVILGdEQUF3QjtBQUV4QixzR0FBbUc7QUFFbkcsa0lBQStIO0FBQy9ILDZFQUEwRTtBQUMxRSx5R0FBc0c7QUFFdEcsK0VBQTRFO0FBQzVFLG1FQUFnRTtBQUNoRSw2RkFBcUg7QUFFckgsTUFBYSxTQUFVLFNBQVEscUJBQVM7SUFXcEM7UUFDSSxLQUFLLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFUTSxNQUFNLENBQUMsV0FBVztRQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUNyQixTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7U0FDeEM7UUFDRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDOUIsQ0FBQztJQU1NLFlBQVk7UUFDZixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRVMsVUFBVTtRQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDWCxHQUFHLEVBQ0gsNkNBQXFCLENBQUMsV0FBVyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyw2Q0FBcUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUM3RixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNwQyxDQUFDO1FBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQ1gsWUFBWSxFQUNaLDZDQUFxQixDQUFDLFdBQVcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsNkNBQXFCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFDN0YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDcEMsQ0FBQztRQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUNYLHNC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SSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzVELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFL0MsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RELEdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNsRCxDQUFDO0NBQ0o7QUFySUQsOEJBcUlDIiwiZmlsZSI6InBsdWdpbnMvU1NQL3NlbGYtc2VydmljZS1wb3J0YWwvc2VydmVyL1NTUFJvdXRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChDKSAyMDA2LTIwMjEgYy5hLnAuZS4gSVQgR21iSCwgaHR0cHM6Ly93d3cuY2FwZS1pdC5kZVxuICogLS1cbiAqIFRoaXMgc29mdHdhcmUgY29tZXMgd2l0aCBBQlNPTFVURUxZIE5PIFdBUlJBTlRZLiBGb3IgZGV0YWlscywgc2VlXG4gKiB0aGUgZW5jbG9zZWQgZmlsZSBMSUNFTlNFIGZvciBsaWNlbnNlIGluZm9ybWF0aW9uIChHUEwzKS4gSWYgeW91XG4gKiBkaWQgbm90IHJlY2VpdmUgdGhpcyBmaWxlLCBzZWUgaHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9ncGwtMy4wLnR4dC5cbiAqIC0tXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgS0lYUm91dGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vZnJvbnRlbmQtYXBwbGljYXRpb25zL2FnZW50LXBvcnRhbC9zZXJ2ZXIvcm91dGVzL0tJWFJvdXRlcic7XG5pbXBvcnQgeyBJS0lYTW9kdWxlRXh0ZW5zaW9uIH0gZnJvbSAnLi4vLi4vLi4vLi4vZnJvbnRlbmQtYXBwbGljYXRpb25zL2FnZW50LXBvcnRhbC9tb2RlbC9JS0lYTW9kdWxlRXh0ZW5zaW9uJztcbmltcG9ydCB7IEFnZW50UG9ydGFsRXh0ZW5zaW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2Zyb250ZW5kLWFwcGxpY2F0aW9ucy9hZ2VudC1wb3J0YWwvc2VydmVyL2V4dGVuc2lvbnMvQWdlbnRQb3J0YWxFeHRlbnNpb25zJztcbmltcG9ydCB7IFBsdWdpblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvc2VydmljZXMvUGx1Z2luU2VydmljZSc7XG5pbXBvcnQgeyBVc2VyVHlwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2Zyb250ZW5kLWFwcGxpY2F0aW9ucy9hZ2VudC1wb3J0YWwvbW9kdWxlcy91c2VyL21vZGVsL1VzZXJUeXBlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL3NlcnZpY2VzL0NvbmZpZ3VyYXRpb25TZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dpbmdTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL3NlcnZpY2VzL0xvZ2dpbmdTZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhlbnRpY2F0aW9uU2VydmljZSB9IGZyb20gJy4vQXV0aGVudGljYXRpb25TZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhlbnRpY2F0aW9uU2VydmljZSBhcyBBUEF1dGhlbnRpY2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZlci9zZXJ2aWNlcy9BdXRoZW50aWNhdGlvblNlcnZpY2UnO1xuXG5leHBvcnQgY2xhc3MgU1NQUm91dGVyIGV4dGVuZHMgS0lYUm91dGVyIHtcblxuICAgIHByaXZhdGUgc3RhdGljIElOU1RBTkNFOiBTU1BSb3V0ZXI7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6IFNTUFJvdXRlciB7XG4gICAgICAgIGlmICghU1NQUm91dGVyLklOU1RBTkNFKSB7XG4gICAgICAgICAgICBTU1BSb3V0ZXIuSU5TVEFOQ0UgPSBuZXcgU1NQUm91dGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNTUFJvdXRlci5JTlNUQU5DRTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRCYXNlUm91dGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICcvc3NwJztcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIuZ2V0KFxuICAgICAgICAgICAgJy8nLFxuICAgICAgICAgICAgQXV0aGVudGljYXRpb25TZXJ2aWNlLmdldEluc3RhbmNlKCkuaXNBdXRoZW50aWNhdGVkLmJpbmQoQXV0aGVudGljYXRpb25TZXJ2aWNlLmdldEluc3RhbmNlKCkpLFxuICAgICAgICAgICAgdGhpcy5nZXRTU1BBcHBsaWNhdGlvbi5iaW5kKHRoaXMpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5yb3V0ZXIuZ2V0KFxuICAgICAgICAgICAgJy86bW9kdWxlSWQnLFxuICAgICAgICAgICAgQXV0aGVudGljYXRpb25TZXJ2aWNlLmdldEluc3RhbmNlKCkuaXNBdXRoZW50aWNhdGVkLmJpbmQoQXV0aGVudGljYXRpb25TZXJ2aWNlLmdldEluc3RhbmNlKCkpLFxuICAgICAgICAgICAgdGhpcy5nZXRTU1BBcHBsaWNhdGlvbi5iaW5kKHRoaXMpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5yb3V0ZXIuZ2V0KFxuICAgICAgICAgICAgJy86bW9kdWxlSWQvOm9iamVjdElkJyxcbiAgICAgICAgICAgIEF1dGhlbnRpY2F0aW9uU2VydmljZS5nZXRJbnN0YW5jZSgpLmlzQXV0aGVudGljYXRlZC5iaW5kKEF1dGhlbnRpY2F0aW9uU2VydmljZS5nZXRJbnN0YW5jZSgpKSxcbiAgICAgICAgICAgIHRoaXMuZ2V0U1NQQXBwbGljYXRpb24uYmluZCh0aGlzKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucm91dGVyLmdldChcbiAgICAgICAgICAgICcvOm1vZHVsZUlkLzpvYmplY3RJZC8qJyxcbiAgICAgICAgICAgIEF1dGhlbnRpY2F0aW9uU2VydmljZS5nZXRJbnN0YW5jZSgpLmlzQXV0aGVudGljYXRlZC5iaW5kKEF1dGhlbnRpY2F0aW9uU2VydmljZS5nZXRJbnN0YW5jZSgpKSxcbiAgICAgICAgICAgIHRoaXMuZ2V0U1NQQXBwbGljYXRpb24uYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0U1NQQXBwbGljYXRpb24ocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUGF0aCA9IHBhdGguam9pbignLi4nLCAnd2ViYXBwJywgJ3NzcC1hcHBsaWNhdGlvbicpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHJlcXVpcmUodGVtcGxhdGVQYXRoKS5kZWZhdWx0O1xuXG4gICAgICAgIGxldCBtb2R1bGVzID0gYXdhaXQgUGx1Z2luU2VydmljZS5nZXRJbnN0YW5jZSgpLmdldEV4dGVuc2lvbnM8SUtJWE1vZHVsZUV4dGVuc2lvbj4oXG4gICAgICAgICAgICBBZ2VudFBvcnRhbEV4dGVuc2lvbnMuTU9EVUxFU1xuICAgICAgICApO1xuXG4gICAgICAgIG1vZHVsZXMgPSBtb2R1bGVzLmZpbHRlcigobSkgPT4gIW0uYXBwbGljYXRpb25zLmxlbmd0aCB8fCBtLmFwcGxpY2F0aW9ucy5zb21lKChhKSA9PiBhID09PSAnU1NQJykpO1xuXG4gICAgICAgIChyZXMgYXMgYW55KS5tYXJrbyh0ZW1wbGF0ZSwgeyBtb2R1bGVzIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXRTU1BMb2dpbihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc3NvRW5hYmxlZCA9IHByb2Nlc3MuZW52LlNTT19FTkFCTEVEX1NTUCA9PT0gJ3RydWUnO1xuXG4gICAgICAgIGlmIChzc29FbmFibGVkKSB7XG4gICAgICAgICAgICBpZiAoIXJlcS5jb29raWVzLmF1dGhOZWdvdGlhdGlvbkRvbmUgJiYgIXJlcS5jb29raWVzLmF1dGhOb1NTTykge1xuICAgICAgICAgICAgICAgIHJlcy5jb29raWUoJ2F1dGhOZWdvdGlhdGlvbkRvbmUnLCB0cnVlLCB7IGh0dHBPbmx5OiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ1dXVy1BdXRoZW50aWNhdGUnLCAnTmVnb3RpYXRlJyk7XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg0MDEpO1xuICAgICAgICAgICAgICAgIHJlcy5zZW5kKFxuICAgICAgICAgICAgICAgICAgICBgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICAgICAgICAgIDxodG1sIGxhbmc9XCJlblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlPktJWCBBZ2VudCBQb3J0YWw8L3RpdGxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJyZWZyZXNoXCIgY29udGVudD1cIjM7IFVSTD0vXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Ym9keT48L2JvZHk+XG4gICAgICAgICAgICAgICAgICAgIDwvaHRtbD5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGF1dGhUeXBlID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IG5lZ290aWF0aW9uVG9rZW4gPSAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBhdXRob3JpemF0aW9uID0gcmVxLmhlYWRlcnNbJ2F1dGhvcml6YXRpb24nXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGF1dGhvcml6YXRpb24gPT09ICdzdHJpbmcnICYmIGF1dGhvcml6YXRpb24uc3BsaXQoJyAnKVswXSA9PT0gJ05lZ290aWF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYWxyZWFkeSBuZWdvdGlhdGVkIChTU08pXG4gICAgICAgICAgICAgICAgICAgIG5lZ290aWF0aW9uVG9rZW4gPSBhdXRob3JpemF0aW9uLnNwbGl0KCcgJylbMV07XG4gICAgICAgICAgICAgICAgICAgIGF1dGhUeXBlID0gJ25lZ290aWF0ZSB0b2tlbiAoU1NPKSc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHVzZXIgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAocmVxLmhlYWRlcnNbJ3gta2l4LXVzZXInXSAmJiB0eXBlb2YgcmVxLmhlYWRlcnNbJ3gta2l4LXVzZXInXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9naW4gd2l0aCB0cnVzdGVkIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICB1c2VyID0gcmVxLmhlYWRlcnNbJ3gta2l4LXVzZXInXTtcbiAgICAgICAgICAgICAgICAgICAgYXV0aFR5cGUgPSAndHJ1c3RlZCBIVFRQIGhlYWRlcic7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuID0gYXdhaXQgQVBBdXRoZW50aWNhdGlvblNlcnZpY2UuZ2V0SW5zdGFuY2UoKS5sb2dpbihcbiAgICAgICAgICAgICAgICAgICAgdXNlciwgbnVsbCwgVXNlclR5cGUuQ1VTVE9NRVIsIG5lZ290aWF0aW9uVG9rZW4sIG51bGwsIG51bGwsIGZhbHNlXG4gICAgICAgICAgICAgICAgKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBMb2dnaW5nU2VydmljZS5nZXRJbnN0YW5jZSgpLmVycm9yKCdFcnJvciB3aGVuIHRyeWluZyB0byBsb2dpbiB3aXRoICcgKyBhdXRoVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5jb29raWUoJ3NzcC10b2tlbicsIHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmNsZWFyQ29va2llKCdhdXRoTmVnb3RpYXRpb25Eb25lJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICBgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlPktJWCBBZ2VudCBQb3J0YWw8L3RpdGxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWV0YSBodHRwLWVxdWl2PVwicmVmcmVzaFwiIGNvbnRlbnQ9XCIzOyBVUkw9L1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Ym9keT48L2JvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2h0bWw+YFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucm91dGVUb0xvZ2luUGFnZShyZXEsIHJlcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByb3V0ZVRvTG9naW5QYWdlKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IHZvaWQge1xuICAgICAgICByZXMuY2xlYXJDb29raWUoJ3NzcC10b2tlbicpO1xuICAgICAgICByZXMuY2xlYXJDb29raWUoJ2F1dGhOZWdvdGlhdGlvbkRvbmUnKTtcbiAgICAgICAgcmVzLmNvb2tpZSgnYXV0aE5vU1NPJywgdHJ1ZSwgeyBodHRwT25seTogdHJ1ZSB9KTtcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVBhdGggPSBwYXRoLmpvaW4oJy4uJywgJ3dlYmFwcCcsICdzc3AtbG9naW4nKTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKHRlbXBsYXRlUGF0aCkuZGVmYXVsdDtcblxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IGAke3RoaXMuZ2V0QmFzZVJvdXRlKCl9JHtyZXEudXJsfWA7XG4gICAgICAgIChyZXMgYXMgYW55KS5tYXJrbyh0ZW1wbGF0ZSwgeyByZWRpcmVjdFVybCB9KTtcbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii4uLy4uLy4uLy4uIn0=
