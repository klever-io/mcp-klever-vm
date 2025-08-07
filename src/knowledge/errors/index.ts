/**
 * Error-related knowledge entries
 */

import paymentErrorsKnowledge from './payment-errors.js';
import commonErrorsKnowledge from './common-errors.js';

export const errorsKnowledge = [
  ...paymentErrorsKnowledge,
  ...commonErrorsKnowledge,
];

export default errorsKnowledge;