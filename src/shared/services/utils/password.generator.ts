export function generatePassword(): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  const minLength = 8;
  const maxLength = 16;

  const cryptoObj = window.crypto || (window as any).msCrypto;

  const length =
    minLength +
    Math.floor(
      cryptoObj.getRandomValues(new Uint32Array(1))[0] %
        (maxLength - minLength + 1)
    );

  const randomValues = new Uint32Array(length);
  cryptoObj.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    const index = randomValues[i] % charset.length;
    password += charset[index];
  }

  return password;
}
