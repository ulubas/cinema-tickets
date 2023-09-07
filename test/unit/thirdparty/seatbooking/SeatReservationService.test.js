import SeatReservationService from '../../../../src/thirdparty/seatbooking/SeatReservationService.js';

describe('SeatReservationService', () => {
  let seatReservationService;

  beforeEach(() => {
    seatReservationService = new SeatReservationService();
  });

  describe('#reserveSeat method', () => {
    it('should throw a TypeError if accountId is not an integer', () => {
      // Given: an invalid accountId (not an integer)
      const invalidAccountId = '12345';

      // When: the reserveSeat method is called with the invalid accountId
      // Then: a TypeError should be thrown with a specific error message
      expect(() =>
        seatReservationService.reserveSeat(invalidAccountId, 2),
      ).toThrow(TypeError);
      expect(() =>
        seatReservationService.reserveSeat(invalidAccountId, 2),
      ).toThrow('accountId must be an integer');
    });

    it('should throw a TypeError if totalSeatsToAllocate is not an integer', () => {
      // Given: an invalid totalSeatsToAllocate (not an integer)
      const invalidTotalSeatsToAllocate = '5';

      // When: the reserveSeat method is called with the invalid totalSeatsToAllocate
      // Then: a TypeError should be thrown with a specific error message
      expect(() =>
        seatReservationService.reserveSeat(1, invalidTotalSeatsToAllocate),
      ).toThrow(TypeError);
      expect(() =>
        seatReservationService.reserveSeat(1, invalidTotalSeatsToAllocate),
      ).toThrow('totalSeatsToAllocate must be an integer');
    });

    it('should not throw any error if the arguments are valid', () => {
      // Given: valid arguments (both accountId and totalSeatsToAllocate are integers)
      const validAccountId = 1;
      const validTotalSeatsToAllocate = 5;

      // When: the reserveSeat method is called with valid arguments
      // Then: no error should be thrown
      expect(() =>
        seatReservationService.reserveSeat(
          validAccountId,
          validTotalSeatsToAllocate,
        ),
      ).not.toThrow();
    });
  });
});
