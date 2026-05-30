interface BREInput {
  dob: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}

interface BREResult {
  passed: boolean;
  reason?: string;
}

export const runBRE = (data: BREInput): BREResult => {
  const today = new Date();
  const birthDate = new Date(data.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 23 || age > 50) {
    return { passed: false, reason: `Age must be between 23 and 50. Your age: ${age}` };
  }

  if (data.monthlySalary < 25000) {
    return {
      passed: false,
      reason: `Monthly salary must be at least ₹25,000. Provided: ₹${data.monthlySalary}`,
    };
  }

  // Valid PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(data.pan)) {
    return { passed: false, reason: "Invalid PAN format. Expected format: ABCDE1234F" };
  }

  if (data.employmentMode === "Unemployed") {
    return { passed: false, reason: "Unemployed applicants are not eligible for loans" };
  }

  return { passed: true };
};