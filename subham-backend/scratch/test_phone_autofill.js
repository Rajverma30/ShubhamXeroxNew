function normalisePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return null;
  let ten = digits;
  if (digits.length > 10) {
    if (digits.length === 12 && digits.startsWith('91')) {
      ten = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      ten = digits.slice(1);
    } else {
      ten = digits.slice(-10);
    }
  }
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

function cleanPhoneInput(input) {
  const raw = String(input || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length > 10) {
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return digits.slice(1);
    }
    const norm = normalisePhone(digits);
    if (norm) return norm;

    if (raw.includes('+91') || digits.startsWith('91') || digits.startsWith('0')) {
      return digits.slice(-10);
    }
    return digits.slice(0, 10);
  }

  return digits;
}

const testCases = [
  '916265660387',
  '+916265660387',
  '+91 62656 60387',
  '06265660387',
  '6265660387',
  '9162656603',
  '+919162656603',
];

console.log('--- Testing cleanPhoneInput & normalisePhone ---');
testCases.forEach((tc) => {
  const cleaned = cleanPhoneInput(tc);
  const norm = normalisePhone(tc);
  console.log(`Input: "${tc}" => Cleaned: "${cleaned}", Normalised: "${norm}"`);
});
