import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_KEY_LENGTH = 64

export function validatePassword(password) {
  return typeof password === 'string'
    && password.length >= 10
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
}

export function hashPassword(password) {
  const salt = randomBytes(16)
  const digest = scryptSync(password, salt, SCRYPT_KEY_LENGTH)
  return `scrypt:${salt.toString('base64url')}:${digest.toString('base64url')}`
}

export function verifyPassword(password, encoded) {
  try {
    const [algorithm, saltText, digestText] = String(encoded).split(':')
    if (algorithm !== 'scrypt' || !saltText || !digestText) return false
    const salt = Buffer.from(saltText, 'base64url')
    const expected = Buffer.from(digestText, 'base64url')
    const actual = scryptSync(password, salt, expected.length)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token) {
  return createHash('sha256').update(String(token)).digest('hex')
}
