import { IsEmail, IsUrl } from 'class-validator';
import type { SendResetPasswordEmailContract } from '../../../../src-shared/contracts';

export class SendResetPasswordEmailDto implements SendResetPasswordEmailContract {
  @IsEmail()
  to: string;

  @IsUrl({ require_tld: false })
  resetLink: string;
}
