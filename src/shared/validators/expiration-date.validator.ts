import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Decorator function that validates the expiration date of a credit card.
 * The expiration date must be in the format "MM/YY" or "MM/YYYY".
 * The year must be between the current year and the next 20 years.
 * The month must be between 1 and 12.
 * @param validationOptions - Optional validation options.
 * @returns A decorator function that can be used to validate the expiration date.
 */
export function IsExpirationDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isExpirationDateValid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          console.log('value', value);
          if (typeof value !== 'string') return false;

          const [month, year] = value
            .split('/')
            .map((val) => parseInt(val, 10));
          const currentYear = new Date().getFullYear() % 100; // YY format
          const currentMonth = new Date().getMonth() + 1; // 1 - 12 for January to December

          // Adjust year for MM/YY and MM/YYYY formats
          const adjustedYear = year > 2000 ? year - 2000 : year;

          if (adjustedYear < currentYear || adjustedYear > currentYear + 20) {
            // Check if year is in a reasonable range
            return false;
          } else if (adjustedYear === currentYear && month < currentMonth) {
            // Check if month is not in the past for the current year
            return false;
          } else if (month < 1 || month > 12) {
            // Check if month is valid
            return false;
          }
          return true;
        },
        defaultMessage() {
          return 'The expiration date is invalid or expired';
        },
      },
    });
  };
}
