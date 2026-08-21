import crypto from 'node:crypto';
import { AUTH_SECRET } from '../config/env.js';

export function signToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}
