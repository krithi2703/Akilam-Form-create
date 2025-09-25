export const validateField = (column, value) => {
  const { ColumnName, IsMandatory, Validation } = column; // Assuming 'Validation' property exists on the column object

  if (IsMandatory && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return `"${ColumnName}" is required.`;
  }

  // If there's no specific validation rule or no value to validate, return early
  if (!Validation || !value) {
    return '';
  }

  switch (Validation) {
    case 'Email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Email must be valid (example@domain.com)';
      }
      break;
    case 'Mobile':
      if (!/^\d{10}$/.test(value)) {
        return 'Mobile number must be 10 digits';
      }
      break;
    case 'Password':
      // This validation might be more complex and usually handled on the backend or during registration
      // For now, keeping the existing client-side logic
      if (value.length < 8 || !/[A-Z]/.test(value) || !/\d/.test(value)) {
        return 'Password must have at least 8 characters, 1 uppercase, 1 number';
      }
      break;
    case 'Numeric':
      if (!/^\d+$/.test(value)) {
        return 'Only numeric values allowed';
      }
      break;
    case 'Alphabet':
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        return 'Only alphabets allowed (A-Z, a-z)';
      }
      break;
    // Add more cases for other validation types as needed
    default:
      break;
  }

  return '';
};