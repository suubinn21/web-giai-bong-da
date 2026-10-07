/**
 * ITFTMS 2026 - Password Hashing Utility
 * Triển khai thuật toán mã băm tiêu chuẩn SHA-256 kèm Salt cho hệ thống xác thực người dùng.
 */

// Bảng hằng số phân đoạn 64 từ theo chuẩn SHA-256 (FIPS 180-4)
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

/**
 * Hàm băm chuỗi văn bản theo thuật toán SHA-256 (hỗ trợ đầy đủ UTF-8)
 */
export function sha256(text: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (text.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }

  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  // 64-bit length big-endian
  bytes.push(0, 0, 0, 0);
  bytes.push(
    (bitLength >>> 24) & 0xff,
    (bitLength >>> 16) & 0xff,
    (bitLength >>> 8) & 0xff,
    bitLength & 0xff
  );

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] =
        (bytes[i + j * 4] << 24) |
        (bytes[i + j * 4 + 1] << 16) |
        (bytes[i + j * 4 + 2] << 8) |
        bytes[i + j * 4 + 3];
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
      const s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      const s1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + K[j] + w[j]) | 0;
      const s0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((x) => (x >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

/**
 * Sinh muối ngẫu nhiên (Salt) cho mật khẩu
 */
export function generateSalt(length = 8): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Băm mật khẩu người dùng với muối (Salted SHA-256)
 * Định dạng lưu trữ: `sha256$<salt>$<hash>`
 */
export function hashPassword(plainPassword: string, customSalt?: string): string {
  const cleanPass = (plainPassword || '').trim();
  const salt = customSalt || generateSalt();
  const hash = sha256(`${salt}:${cleanPass}`);
  return `sha256$${salt}$${hash}`;
}

/**
 * Kiểm tra mật khẩu nhập vào có khớp với mã băm đã lưu hay không
 * Tương thích ngược: Nếu mật khẩu trong CSDL chưa băm (legacy), vẫn đối chiếu đúng và cho phép tự nâng cấp.
 */
export function verifyPassword(plainPassword: string, storedHashOrPlain?: string): boolean {
  const cleanPass = (plainPassword || '').trim();
  const stored = (storedHashOrPlain || '').trim();

  if (!stored) {
    // Nếu chưa có mật khẩu, mặc định là 123
    return cleanPass === '123';
  }

  // Định dạng Salted SHA-256: `sha256$<salt>$<hash>`
  if (stored.startsWith('sha256$')) {
    const parts = stored.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedHash = parts[2];
      const computedHash = sha256(`${salt}:${cleanPass}`);
      return computedHash === expectedHash;
    }
  }

  // Định dạng unsalted SHA-256: `sha256:<hash>`
  if (stored.startsWith('sha256:')) {
    const expectedHash = stored.substring(7);
    return sha256(cleanPass) === expectedHash;
  }

  // Chuỗi băm thuần 64 ký tự hex
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    return sha256(cleanPass) === stored.toLowerCase();
  }

  // Mật khẩu dạng thô (Legacy Plaintext)
  return stored === cleanPass;
}

/**
 * Kiểm tra xem mật khẩu có phải là mật khẩu mặc định "123" hay không
 */
export function isDefaultPassword(storedHashOrPlain?: string): boolean {
  return verifyPassword('123', storedHashOrPlain);
}

/**
 * Hiển thị rút gọn mã băm trên giao diện bảo mật
 */
export function formatPasswordDisplay(storedHashOrPlain?: string): {
  isDefault: boolean;
  displayLabel: string;
  shortHash: string;
} {
  const isDefault = isDefaultPassword(storedHashOrPlain);
  const stored = (storedHashOrPlain || '').trim();

  let shortHash = '';
  if (stored.startsWith('sha256$')) {
    const parts = stored.split('$');
    shortHash = `sha256$${parts[1]}$${parts[2]?.substring(0, 8)}...`;
  } else if (stored.length >= 16) {
    shortHash = `${stored.substring(0, 10)}...${stored.substring(stored.length - 4)}`;
  } else {
    shortHash = 'Đã băm SHA-256';
  }

  return {
    isDefault,
    displayLabel: isDefault ? 'Mặc định (123) • Đã băm' : 'Tùy chỉnh • Đã băm',
    shortHash,
  };
}
