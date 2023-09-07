import { TicketType, TicketPrices, MaxTicketCount } from './lib/constants.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import InvalidTicketRequestException from './lib/InvalidTicketRequestException.js';
// eslint-disable-next-line no-unused-vars
import TicketTypeRequest from './lib/TicketTypeRequest';

/**
 * TicketService handles the ticket purchasing logic including validating
 * purchase requests, calculating total amount, and reserving seats
 * according to the specified business rules.
 */
export default class TicketService {
  constructor(ticketPaymentService, seatReservationService) {
    this.ticketPaymentService = ticketPaymentService;
    this.seatReservationService = seatReservationService;
  }

  /**
   * purchaseTickets is the public method that orchestrates the ticket
   * purchasing process. It accepts an account ID and a spread of
   * TicketTypeRequest objects, and processes the purchase request
   * accordingly.
   *
   * @param {number} accountId - The ID of the account making the purchase.
   * @param {...TicketTypeRequest} ticketTypeRequests - A spread of TicketTypeRequest objects representing the ticket purchase request.
   * @throws {InvalidPurchaseException} Throws an exception if the purchase request is invalid.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    try {
      // Validate the ticket requests
      this.#validateTicketRequests(ticketTypeRequests);

      // Calculate total ticket payment amount and the seat count required
      const totalAmount = this.#calculateTotalAmount(ticketTypeRequests);
      const totalSeats = this.#calculateTotalSeats(ticketTypeRequests);

      // Process tickets via payment and seat reservation services
      this.ticketPaymentService.makePayment(accountId, totalAmount);
      this.seatReservationService.reserveSeat(accountId, totalSeats);
    } catch (error) {
      throw new InvalidPurchaseException(error.message);
    }
  }

  /**
   * #validateTicketRequests validates the ticket purchase request
   * according to the business rules.
   *
   * @param {...TicketTypeRequest} ticketTypeRequests - A spread of TicketTypeRequest objects representing the ticket purchase request.
   * @throws {InvalidTicketRequestException} Throws an exception if the purchase request violates any business rule.
   * @private
   */
  #validateTicketRequests(ticketTypeRequests) {
    const ticketCounts = {
      [TicketType.ADULT]: 0,
      [TicketType.CHILD]: 0,
      [TicketType.INFANT]: 0,
    };
    let totalTickets = 0;

    ticketTypeRequests.forEach(ticketTypeRequest => {
      const ticketType = ticketTypeRequest.getTicketType();
      const ticketCount = ticketTypeRequest.getNoOfTickets();

      ticketCounts[ticketType] += ticketCount;
      totalTickets += ticketCount;
    });

    // Business Rule: Only a maximum of 20 tickets can be purchased at a time.
    if (totalTickets > MaxTicketCount) {
      throw new InvalidTicketRequestException(
        `Cannot purchase more than ${MaxTicketCount} tickets at a time.`,
      );
    }

    // Business Rule: Child and Infant tickets cannot be purchased without purchasing an Adult ticket.
    if (
      ticketCounts.ADULT === 0 &&
      (ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0)
    ) {
      throw new InvalidTicketRequestException(
        'Child and Infant tickets cannot be purchased without purchasing an Adult ticket.',
      );
    }

    // Business Rule: Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.
    // Hence, the number of infant tickets cannot exceed the number of adult tickets.
    if (ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidTicketRequestException(
        'The number of Infant tickets cannot exceed the number of Adult tickets.',
      );
    }
  }

  /**
   * #calculateTotalAmount calculates the total amount to be paid for the
   * requested tickets.
   *
   * Given: An array of TicketTypeRequest objects representing the ticket purchase request.
   * When: Calculating the total amount to be paid.
   * Then: It should return the correct total amount based on the ticket prices.
   *
   * @param {TicketTypeRequest[]} ticketTypeRequests - An array of TicketTypeRequest objects representing the ticket purchase request.
   * @returns {number} The total amount to be paid.
   * @private
   */
  #calculateTotalAmount(ticketTypeRequests) {
    let totalAmount = 0;

    ticketTypeRequests.forEach(ticketTypeRequest => {
      const ticketType = ticketTypeRequest.getTicketType();
      const ticketCount = ticketTypeRequest.getNoOfTickets();
      totalAmount += TicketPrices[ticketType] * ticketCount;
    });

    return totalAmount;
  }

  /**
   * #calculateTotalSeats calculates the total number of seats to be reserved
   * based on the ticket purchase request.
   *
   * Given: An array of TicketTypeRequest objects representing the ticket purchase request.
   * When: Calculating the total number of seats to reserve.
   * Then: It should return the correct total number of seats to reserve (note: infants do not occupy a seat).
   *
   * @param {TicketTypeRequest[]} ticketTypeRequests - An array of TicketTypeRequest objects representing the ticket purchase request.
   * @returns {number} The total number of seats to reserve.
   * @private
   */
  #calculateTotalSeats(ticketTypeRequests) {
    let totalSeats = 0;

    ticketTypeRequests.forEach(ticketTypeRequest => {
      const ticketType = ticketTypeRequest.getTicketType();
      const ticketCount = ticketTypeRequest.getNoOfTickets();

      if (ticketType !== TicketType.INFANT) {
        totalSeats += ticketCount;
      }
    });

    return totalSeats;
  }
}
