/**
 * PURPOSE: Thin HTTP layer for auth endpoints — parses the request, calls
 * authService, and shapes the response envelope + refresh cookie. No
 * business logic or Prisma calls live here.
 * DEPENDENCIES: express, ../services/auth.service, ../utils/cookies,
 * ../utils/AppError
 */

import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from '../utils/cookies';
import { AppError } from '../utils/AppError';
import type { LoginInput, RegisterInput } from '../validators/auth.validator';

function requestContext(req: Request) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  };
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await authService.register(req.body as RegisterInput, requestContext(req));
    setRefreshCookie(res, tokens.refreshToken);
    res.status(201).json({ success: true, data: { user, accessToken: tokens.accessToken } });
  },

  async login(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await authService.login(req.body as LoginInput, requestContext(req));
    setRefreshCookie(res, tokens.refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken: tokens.accessToken } });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!presentedToken) {
      throw new AppError('AUTH_REFRESH_MISSING', 'No active session', 401);
    }

    const { user, tokens } = await authService.refresh(presentedToken, requestContext(req));
    setRefreshCookie(res, tokens.refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken: tokens.accessToken } });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(presentedToken);
    clearRefreshCookie(res);
    res.status(200).json({ success: true, data: { loggedOut: true } });
  },

  async me(req: Request, res: Response): Promise<void> {
    // `authenticate` middleware guarantees req.user is set before this runs.
    const user = await authService.getCurrentUser(req.user!.id);
    res.status(200).json({ success: true, data: { user } });
  }
};
