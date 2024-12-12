import { INVITE_CODE_LENGTH } from '../../constants/inviteCode.js';
import crypto from 'crypto';

export const getInviteCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(INVITE_CODE_LENGTH);

  let inviteCode = '';

  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const index = randomBytes[i] % characters.length;
    inviteCode += characters[index];
  }

  return inviteCode;
};
