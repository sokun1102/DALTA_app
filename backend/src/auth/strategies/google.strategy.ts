import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');
    const isGoogleOAuthConfigured = Boolean(clientID && clientSecret && callbackURL);

    super({
      // Keep app booting even when Google OAuth env vars are missing.
      clientID: clientID || 'disabled-google-client-id',
      clientSecret: clientSecret || 'disabled-google-client-secret',
      callbackURL: callbackURL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });

    if (!isGoogleOAuthConfigured) {
      this.logger.warn(
        'Google OAuth is not fully configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL to enable login with Google.',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
