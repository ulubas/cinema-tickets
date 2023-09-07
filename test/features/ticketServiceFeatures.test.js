import TicketService from '../../src/pairtest/TicketService.js';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest.js';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService.js';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException.js';
import { TicketType, TicketPrices } from '../../src/pairtest/lib/constants.js';

// Alias for describe to make the test suite more BDD-style and readable
const context = describe;

describe('Ticket Service Features', () => {
  let ticketService;
  let makePaymentMock;
  let reserveSeatMock;

  beforeEach(() => {
    ticketService = new TicketService(
      new TicketPaymentService(),
      new SeatReservationService(),
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

  describe('Feature: Purchasing Tickets', () => {
    context('Scenario: Purchasing valid ticket combinations', () => {
      it('should allow purchasing adult tickets only', () => {
        // Given: an account ID and a valid adult ticket purchase request
        const accountId = 1;
        const validTicketRequests = [
          new TicketTypeRequest(TicketType.ADULT, 2),
        ];

        // When: the purchaseTickets method is called
        ticketService.purchaseTickets(accountId, ...validTicketRequests);

        // Then: it should process the payment and reserve the seats without throwing any error
        const expectedTotalAmount = TicketPrices[TicketType.ADULT] * 2;
        const expectedTotalSeats = 2;
        expect(makePaymentMock).toHaveBeenCalledWith(
          accountId,
          expectedTotalAmount,
        );
        expect(reserveSeatMock).toHaveBeenCalledWith(
          accountId,
          expectedTotalSeats,
        );
      });

      it('should allow purchasing adult and child tickets', () => {
        // Given: an account ID and a valid adult and child ticket purchase request
        const accountId = 1;
        const validTicketRequests = [
          new TicketTypeRequest(TicketType.ADULT, 2),
          new TicketTypeRequest(TicketType.CHILD, 1),
        ];

        // When: the purchaseTickets method is called
        ticketService.purchaseTickets(accountId, ...validTicketRequests);

        // Then: it should process the payment and reserve the seats without throwing any error
        const expectedTotalAmount =
          TicketPrices[TicketType.ADULT] * 2 + TicketPrices[TicketType.CHILD];
        const expectedTotalSeats = 3;
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

    context('Scenario: Purchasing invalid ticket combinations', () => {
      it('should not allow purchasing more than 20 tickets at a time', () => {
        // Given: an account ID and a ticket purchase request for more than 20 tickets
        const accountId = 1;
        const invalidTicketRequests = [
          new TicketTypeRequest(TicketType.ADULT, 21),
        ];

        // When: the purchaseTickets method is called
        // Then: it should throw an InvalidPurchaseException with a specific error message
        expect(() =>
          ticketService.purchaseTickets(accountId, ...invalidTicketRequests),
        ).toThrow(InvalidPurchaseException);
        expect(() =>
          ticketService.purchaseTickets(accountId, ...invalidTicketRequests),
        ).toThrow('Cannot purchase more than 20 tickets at a time.');
      });

      it('should not allow purchasing child or infant tickets without an adult ticket', () => {
        // Given: an account ID and a ticket purchase request for child or infant tickets without an adult ticket
        const accountId = 1;
        const invalidTicketRequests = [
          new TicketTypeRequest(TicketType.CHILD, 1),
        ];

        // When: the purchaseTickets method is called
        // Then: it should throw an InvalidPurchaseException with a specific error message
        expect(() =>
          ticketService.purchaseTickets(accountId, ...invalidTicketRequests),
        ).toThrow(InvalidPurchaseException);
        expect(() =>
          ticketService.purchaseTickets(accountId, ...invalidTicketRequests),
        ).toThrow(
          'Child and Infant tickets cannot be purchased without purchasing an Adult ticket.',
        );
      });
    });
  });
});
