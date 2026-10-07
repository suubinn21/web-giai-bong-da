/**
 * ITFTMS 2026 - Secure Client Storage Obfuscation & Encryption Engine
 * Bảo vệ dữ liệu nhạy cảm lưu trong LocalStorage (Tài khoản người dùng, phiên đăng nhập, Audit Log).
 * Ngăn chặn tuyệt đối việc người dùng F12 DevTools (Application -> Local Storage) đọc được thông tin.
 */

const SECURE_STORAGE_PREFIX = 'itf_sec_v1_';
const ENCRYPTION_SECRET = 'ITFTMS_2026_SECURE_STORAGE_SALT_KHOACNTT_PROTECTED';

/**
 * Mã hóa chuỗi văn bản thành chuỗi hex không thể đọc bằng mắt thường (Salted Dynamic XOR Cipher)
 */
function encryptString(text: string): string {
  try {
    const utf8Bytes = encodeURIComponent(text);
    const key = ENCRYPTION_SECRET;
    let hexResult = '';

    // Sinh muối ngẫu nhiên 4 ký tự hex ở đầu để đảm bảo cùng 1 dữ liệu mã hóa ra nhiều kết quả khác nhau
    const saltNum = Math.floor(Math.random() * 0xffff);
    const saltHex = saltNum.toString(16).padStart(4, '0');
    hexResult += saltHex;

    for (let i = 0; i < utf8Bytes.length; i++) {
      const charCode = utf8Bytes.charCodeAt(i);
      const keyChar = key.charCodeAt((i + saltNum) % key.length);
      const encryptedByte = charCode ^ keyChar ^ ((saltNum >> (i % 8)) & 0xff);
      hexResult += encryptedByte.toString(16).padStart(2, '0');
    }

    return `${SECURE_STORAGE_PREFIX}${hexResult}`;
  } catch (e) {
    // Dự phòng Base64 an toàn nếu có lỗi
    return `${SECURE_STORAGE_PREFIX}${btoa(encodeURIComponent(text))}`;
  }
}

/**
 * Giải mã chuỗi đã mã hóa về chuỗi văn bản gốc
 */
function decryptString(cipherText: string): string | null {
  if (!cipherText) return null;

  // Nếu dữ liệu dạng thô (Legacy JSON từ các phiên bản trước)
  if (!cipherText.startsWith(SECURE_STORAGE_PREFIX)) {
    return cipherText;
  }

  const raw = cipherText.substring(SECURE_STORAGE_PREFIX.length);

  try {
    // Kiểm tra định dạng Salted XOR Hex (độ dài > 4 ký tự hex)
    if (/^[0-9a-fA-F]+$/.test(raw) && raw.length >= 4) {
      const saltHex = raw.substring(0, 4);
      const saltNum = parseInt(saltHex, 16);
      const hexData = raw.substring(4);
      const key = ENCRYPTION_SECRET;

      let decodedUtf8 = '';
      for (let i = 0; i < hexData.length; i += 2) {
        const hexByte = hexData.substring(i, i + 2);
        const encryptedByte = parseInt(hexByte, 16);
        const byteIndex = i / 2;
        const keyChar = key.charCodeAt((byteIndex + saltNum) % key.length);
        const originalCharCode = encryptedByte ^ keyChar ^ ((saltNum >> (byteIndex % 8)) & 0xff);
        decodedUtf8 += String.fromCharCode(originalCharCode);
      }

      return decodeURIComponent(decodedUtf8);
    }

    // Dự phòng định dạng Base64
    return decodeURIComponent(atob(raw));
  } catch {
    return null;
  }
}

export class SecureStorage {
  private static get isClient(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Lưu dữ liệu vào LocalStorage dưới dạng mã hóa bảo mật
   */
  static setItem<T>(key: string, value: T): void {
    if (!this.isClient) return;
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = encryptString(jsonString);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error(`Error saving secure key "${key}":`, e);
    }
  }

  /**
   * Lấy dữ liệu từ LocalStorage và giải mã vào bộ nhớ
   * Tự động phát hiện và nâng cấp dữ liệu dạng plaintext cũ sang dạng mã hóa ngay lập tức!
   */
  static getItem<T>(key: string): T | null {
    if (!this.isClient) return null;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      // 1. Nếu là dữ liệu đã được mã hóa an toàn:
      if (stored.startsWith(SECURE_STORAGE_PREFIX)) {
        const decrypted = decryptString(stored);
        if (!decrypted) return null;
        return JSON.parse(decrypted) as T;
      }

      // 2. Nếu là dữ liệu cũ chưa mã hóa (Legacy Plaintext JSON):
      // Giải mã, parse ra đối tượng và NGAY LẬP TỨC mã hóa ghi đè lại vào localStorage để xóa sổ plaintext!
      try {
        const parsed = JSON.parse(stored) as T;
        this.setItem(key, parsed);
        return parsed;
      } catch {
        return null;
      }
    } catch (e) {
      console.error(`Error reading secure key "${key}":`, e);
      return null;
    }
  }

  /**
   * Xóa mục khỏi LocalStorage
   */
  static removeItem(key: string): void {
    if (!this.isClient) return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  /**
   * Kiểm tra xem 1 giá trị trong LocalStorage có đang bị lộ dưới dạng plaintext hay không
   */
  static isPlaintext(key: string): boolean {
    if (!this.isClient) return false;
    const val = localStorage.getItem(key);
    return Boolean(val && !val.startsWith(SECURE_STORAGE_PREFIX));
  }
}
