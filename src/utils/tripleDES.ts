import { createCipheriv, createDecipheriv, createHash } from 'crypto';

import { SEED_PHRASE_KEY } from '@/constants';

function generateTripleDESKey(): string {
  // Sử dụng 24 ký tự đầu tiên của chuỗi hex làm khóa TripleDES
  return createHash('sha256', {
    outputLength: 24,
  })
    .update(SEED_PHRASE_KEY)
    .digest('hex')
    .substring(0, 24);
}

function generateTripleDESKeyIv(): string {
  return createHash('sha256', {
    outputLength: 24,
  })
    .update(generateTripleDESKey())
    .digest('hex')
    .substring(0, 8);
}

// Hàm mã hóa bằng TripleDES
export function tripleDESEncryptText(text: string): string | undefined {
  try {
    const cipherKey = createCipheriv('des-ede3-cbc', generateTripleDESKey(), generateTripleDESKeyIv());
    const encryptText = cipherKey.update(text, 'utf-8', 'base64');
    return encryptText + cipherKey.final('base64');
  } catch (error) {
    console.error(error);
  }
}

// Hàm giải mã bằng TripleDES
export function tripleDESDecryptText(encryptedText: string): string | undefined {
  try {
    const cipherKey = createDecipheriv('des-ede3-cbc', generateTripleDESKey(), generateTripleDESKeyIv());
    const decryptText = cipherKey.update(encryptedText, 'base64', 'utf-8');
    return decryptText + cipherKey.final('utf-8');
  } catch (error) {
    console.error(error);
  }
}
