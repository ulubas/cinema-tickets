import TicketService from '../../../src/pairtest/TicketService.js';
import TicketTypeRequest from '../../../src/pairtest/lib/TicketTypeRequest.js';
import TicketPaymentService from '../../../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../../../src/thirdparty/seatbooking/SeatReservationService.js';
import InvalidPurchaseException from '../../../src/pairtest/lib/InvalidPurchaseException.js';
import {
  TicketType,
  TicketPrices,
} from '../../../src/pairtest/lib/constants.js';

describe('TicketService', () => {
  let ticketService;
  let ticketPaymentServiceMock;
  let seatReservationServiceMock;
  let makePaymentMock;
  let reserveSeatMock;

  beforeAll(() => {
    ticketPaymentServiceMock = { makePayment: jest.fn() };
    seatReservationServiceMock = { reserveSeat: jest.fn() };
    ticketService = new TicketService(
      ticketPaymentServiceMock,
      seatReservationServiceMock,
    );
    makePaymentMock = jest.spyOn(
      ticketService.ticketPaymentService,
      'makePayment',
    );
    reserveSeatMock = jest.spyOn(
      ticketService.seatReservationService,
      'reserveSeat',
    );
  });

  afterEach(() => {
    makePaymentMock.mockRestore();
    reserveSeatMock.mockRestore();
  });

  describe('TicketService Class - purchaseTickets method', () => {
    it('should throw an InvalidPurchaseException if the purchase request is invalid', () => {
      // Given: An account ID and a set of invalid ticket requests
      const accountId = 1;
      const invalidTicketRequests = [
        new TicketTypeRequest(TicketType.CHILD, 1), // Invalid because there are no adult tickets
      ];

      // When: The purchaseTickets method is called with the invalid requests
      // Then: An InvalidPurchaseException should be thrown
      expect(() =>
        ticketService.purchaseTickets(accountId, ...invalidTicketRequests),
      ).toThrow(InvalidPurchaseException);
    });

    it('should process the payment and reserve seats for valid purchase requests', () => {
      // Given: An account ID and a set of valid ticket requests
      const accountId = 1;
      const validTicketRequests = [
        new TicketTypeRequest(TicketType.ADULT, 2),
        new TicketTypeRequest(TicketType.CHILD, 1),
      ];

      // When: The purchaseTickets method is called with the valid requests
      ticketService.purchaseTickets(accountId, ...validTicketRequests);

      // Then: The payment should be processed and seats should be reserved
      const expectedTotalAmount =
        TicketPrices[TicketType.ADULT] * 2 + TicketPrices[TicketType.CHILD];
      const expectedTotalSeats = 3; // 2 adults and 1 child
      expect(makePaymentMock).toHaveBeenCalledWith(
        accountId,
        expectedTotalAmount,
      );
      expect(reserveSeatMock).toHaveBeenCalledWith(
        accountId,
        expectedTotalSeats,
      );
    });
  });

  describe('TicketService Class - #validateTicketRequests method', () => {
    test('should throw error if more than 20 tickets are purchased at a time', () => {
      // Given: a purchase request for 21 adult tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 21);

      // When: attempting to purchase 21 tickets through the public method
      // Then: it should throw an InvalidPurchaseException with a specific error message
      expect(() => ticketService.purchaseTickets(1, adultTickets)).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, adultTickets)).toThrow(
        'Cannot purchase more than 20 tickets at a time.',
      );
    });

    test('should throw error if child or infant tickets are purchased without an adult ticket', () => {
      // Given: a purchase request for child tickets without adult tickets
      const childTickets = new TicketTypeRequest(TicketType.CHILD, 5);

      // When: the ticket purchase request is validated
      // Then: it should throw an InvalidPurchaseException with a specific error message
      expect(() => ticketService.purchaseTickets(1, childTickets)).toThrow(
        InvalidPurchaseException,
      );
      expect(() => ticketService.purchaseTickets(1, childTickets)).toThrow(
        'Child and Infant tickets cannot be purchased without purchasing an Adult ticket.',
      );
    });

    test('should throw error if the number of infant tickets exceeds the number of adult tickets', () => {
      // Given: a purchase request where the number of infant tickets exceeds the number of adult tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 2);
      const infantTickets = new TicketTypeRequest(TicketType.INFANT, 3);

      // When: the ticket purchase request is validated
      // Then: it should throw an InvalidTicketRequestException with a specific error message
      expect(() =>
        ticketService.purchaseTickets(1, adultTickets, infantTickets),
      ).toThrow(InvalidPurchaseException);
      expect(() =>
        ticketService.purchaseTickets(1, adultTickets, infantTickets),
      ).toThrow(
        'The number of Infant tickets cannot exceed the number of Adult tickets.',
      );
    });

    test('should not throw any error if the purchase request is valid', () => {
      // Given: a valid purchase request with adult, child, and infant tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 2);
      const childTickets = new TicketTypeRequest(TicketType.CHILD, 2);
      const infantTickets = new TicketTypeRequest(TicketType.CHILD, 2);

      // When: the ticket purchase request is validated
      // Then: it should not throw any error
      expect(() =>
        ticketService.purchaseTickets(
          1,
          adultTickets,
          childTickets,
          infantTickets,
        ),
      ).not.toThrow();
    });
  });

  describe('TicketService Class - #calculateTotalAmount method', () => {
    let ticketService;
    let makePaymentMock;

    beforeEach(() => {
      ticketService = new TicketService(
        new TicketPaymentService(),
        new SeatReservationService(),
      );
      makePaymentMock = jest.spyOn(
        ticketService.ticketPaymentService,
        'makePayment',
      );
    });

    afterEach(() => {
      makePaymentMock.mockRestore();
    });

    test('should calculate the correct total amount when only adult tickets are purchased', () => {
      // Given: A purchase request with only adult tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 2);

      // When: The total amount is calculated (indirectly, through the purchaseTickets  method)
      ticketService.purchaseTickets(1, adultTickets);

      // Then: The correct total amount should be passed to the makePayment method
      const correctAmount = TicketPrices[TicketType.ADULT] * 2;
      expect(makePaymentMock).toHaveBeenCalledWith(1, correctAmount);
    });

    test('should calculate the correct total amount when a mix of ticket types are purchased', () => {
      // Given: A purchase request with a mix of adult, child, and infant tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 2);
      const childTickets = new TicketTypeRequest(TicketType.CHILD, 2);
      const infantTickets = new TicketTypeRequest(TicketType.INFANT, 2);

      // When: The total amount is calculated (indirectly, through the purchaseTickets method)
      ticketService.purchaseTickets(
        1,
        adultTickets,
        childTickets,
        infantTickets,
      );

      // Then: The correct total amount should be passed to the makePayment method
      const correctAmount =
        TicketPrices[TicketType.ADULT] * 2 + TicketPrices[TicketType.CHILD] * 2;
      expect(makePaymentMock).toHaveBeenCalledWith(1, correctAmount);
    });

    test('should calculate the correct total amount when only child tickets are purchased (along with adult tickets, as per business rule)', () => {
      // Given: A purchase request with only child tickets (and the necessary adult tickets)
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 1);
      const childTickets = new TicketTypeRequest(TicketType.CHILD, 2);

      // When: The total amount is calculated (indirectly, through the purchaseTickets method)
      ticketService.purchaseTickets(1, adultTickets, childTickets);

      // Then: The correct total amount should be passed to the makePayment method
      const correctAmount =
        TicketPrices[TicketType.ADULT] * 1 + TicketPrices[TicketType.CHILD] * 2;
      expect(makePaymentMock).toHaveBeenCalledWith(1, correctAmount);
    });
  });

  describe('TicketService Class - #calculateTotalSeats method', () => {
    test('should calculate the correct total seats when only adult tickets are purchased', () => {
      // Given: A purchase request with only adult tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 2);

      // When: The total seats are calculated (indirectly, through the purchaseTickets method)
      ticketService.purchaseTickets(1, adultTickets);

      // Then: The correct total seats should be passed to the reserveSeat method
      const correctSeats = 2; // since 2 adult tickets were purchased
      expect(reserveSeatMock).toHaveBeenCalledWith(1, correctSeats);
    });

    test('should calculate the correct total seats when a mix of ticket types are purchased', () => {
      // Given: A purchase request with a mix of adult, child, and infant tickets
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 2);
      const childTickets = new TicketTypeRequest(TicketType.CHILD, 2);
      const infantTickets = new TicketTypeRequest(TicketType.INFANT, 2);

      // When: The total seats are calculated (indirectly, through the purchaseTickets method)
      ticketService.purchaseTickets(
        1,
        adultTickets,
        childTickets,
        infantTickets,
      );

      // Then: The correct total seats should be passed to the reserveSeat method
      const correctSeats = 4; // since infants do not occupy seats
      expect(reserveSeatMock).toHaveBeenCalledWith(1, correctSeats);
    });

    test('should calculate the correct total seats when only child tickets are purchased (along with adult tickets, as per business rule)', () => {
      // Given: A purchase request with only child tickets (and the necessary adult tickets)
      const adultTickets = new TicketTypeRequest(TicketType.ADULT, 1);
      const childTickets = new TicketTypeRequest(TicketType.CHILD, 2);

      // When: The total seats are calculated (indirectly, through the purchaseTickets method)
      ticketService.purchaseTickets(1, adultTickets, childTickets);

      // Then: The correct total seats should be passed to the reserveSeat method
      const correctSeats = 3; // 1 adult and 2 children
      expect(reserveSeatMock).toHaveBeenCalledWith(1, correctSeats);
    });
  });
});
