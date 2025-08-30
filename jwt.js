import { readFileSync } from 'node:fs';
import { createPrivateKey, sign as nodeSign } from 'node:crypto';

function base64url(input) {
  const b64 = Buffer.isBuffer(input)
    ? input.toString('base64')
    : Buffer.from(input).toString('base64');
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}

/**
 * 生成 EdDSA(Ed25519) JWT
 * @returns {string} JWT token
 */
export function generateJWT() {
  // 1) Header 仅保留 alg/kid
  const header = {
    alg: 'EdDSA',
    kid: process.env.QWEATHER_JWT_KID
  };

  // 2) Payload 仅保留 sub/iat/exp
  const iat = unixNow() - 30;            // 当前时间前 30s
  const exp = iat + 12 * 60 * 60;        // 有效期 12h
  const payload = {
    sub: process.env.QWEATHER_JWT_SUB,
    iat,
    exp
  };

  // 3) Base64URL 编码
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // 4) 从 env 加载私钥并签名
  const pem = readFileSync(process.env.QWEATHER_JWT_PRIVATE_KEY_PATH, 'utf8');
  const keyObject = createPrivateKey(pem);
  const signature = nodeSign(null, Buffer.from(signingInput), keyObject);

  // 5) Base64URL 签名
  const encodedSignature = base64url(signature);

  // 6) 拼接最终 Token
  return `${signingInput}.${encodedSignature}`;
}

// 如果直接执行这个文件，则打印生成的 Token
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generateJWT());
}
