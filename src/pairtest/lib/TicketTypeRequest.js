import { TicketType } from './constants.js';

/**
 * Immutable Object.
 */

export default class TicketTypeRequest {
  #type;
  #noOfTickets;

  constructor(type, noOfTickets) {
    if (!Object.values(TicketType).includes(type)) {
      throw new TypeError(
        `type must be ${Object.values(TicketType)
          .slice(0, -1)
          .join(', ')} or ${Object.values(TicketType).slice(-1)}`,
      );
    }

    if (!Number.isInteger(noOfTickets)) {
      throw new TypeError('noOfTickets must be an integer');
    }

    this.#type = type;
    this.#noOfTickets = noOfTickets;
  }

  getNoOfTickets() {
    return this.#noOfTickets;
  }

  getTicketType() {
    return this.#type;
  }
}
