import TicketPaymentService from '../../../../src/thirdparty/paymentgateway/TicketPaymentService.js';

describe('TicketPaymentService', () => {
  let ticketPaymentService;

  beforeEach(() => {
    ticketPaymentService = new TicketPaymentService();
  });

  describe('#makePayment method', () => {
    it('should throw a TypeError if accountId is not an integer', () => {
      // Given: an invalid accountId (not an integer)
      const invalidAccountId = '12345';

      // When: the makePayment method is called with the invalid accountId
      // Then: a TypeError should be thrown with a specific error message
      expect(() =>
        ticketPaymentService.makePayment(invalidAccountId, 100),
      ).toThrow(TypeError);
      expect(() =>
        ticketPaymentService.makePayment(invalidAccountId, 100),
      ).toThrow('accountId must be an integer');
    });

    it('should throw a TypeError if totalAmountToPay is not an integer', () => {
      // Given: an invalid totalAmountToPay (not an integer)
      const invalidTotalAmountToPay = '100.50';

      // When: the makePayment method is called with the invalid totalAmountToPay
      // Then: a TypeError should be thrown with a specific error message
      expect(() =>
        ticketPaymentService.makePayment(1, invalidTotalAmountToPay),
      ).toThrow(TypeError);
      expect(() =>
        ticketPaymentService.makePayment(1, invalidTotalAmountToPay),
      ).toThrow('totalAmountToPay must be an integer');
    });

    it('should not throw any error if the arguments are valid', () => {
      // Given: valid arguments (both accountId and totalAmountToPay are integers)
      const validAccountId = 1;
      const validTotalAmountToPay = 100;

      // When: the makePayment method is called with valid arguments
      // Then: no error should be thrown
      expect(() =>
        ticketPaymentService.makePayment(validAccountId, validTotalAmountToPay),
      ).not.toThrow();
    });
  });
});
