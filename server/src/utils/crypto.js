/**
 * AES-256-GCM field-level encryption for sensitive plan data.
 * Stored format: enc:v1:<iv hex>:<auth tag hex>:<cipher hex>
 */
const crypto = require('crypto');

const PREFIX = 'enc:v1:';

function getKey() {
  const hex = process.env.ENCRYPTION_KEY || '';
  if (hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

function encrypt(value) {
  if (value === undefined || value === null || value === '') return value;
  const text = String(value);
  if (text.startsWith(PREFIX)) return text; // already encrypted
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

function decrypt(value) {
  if (typeof value !== 'string' || !value.startsWith(PREFIX)) return value;
  try {
    const [ivHex, tagHex, dataHex] = value.slice(PREFIX.length).split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
  } catch (err) {
    return '[unable to decrypt]';
  }
}

/** Mongoose field definition helper for an encrypted string */
const encryptedString = (extra = {}) => ({ type: String, set: encrypt, get: decrypt, ...extra });

module.exports = { encrypt, decrypt, encryptedString };
