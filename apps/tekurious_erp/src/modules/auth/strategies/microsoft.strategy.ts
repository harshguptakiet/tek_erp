import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get('MICROSOFT_CALLBACK_URL'),
      scope: ['user.read'],
      tenant: 'common', // Support both personal and organizational accounts
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;

    const [firstName, ...lastNameParts] = displayName.split(' ');
    const lastName = lastNameParts.join(' ');

    const user = {
      provider: 'MICROSOFT',
      providerId: id,
      email: emails[0].value,
      firstName: firstName || displayName,
      lastName: lastName || '',
      picture: photos[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
