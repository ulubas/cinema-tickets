import TicketTypeRequest from '../../../../src/pairtest/lib/TicketTypeRequest.js';
import { TicketType } from '../../../../src/pairtest/lib/constants.js';

describe('TicketTypeRequest Class', () => {
  describe('Constructor', () => {
    // Given a valid ticket type and number of tickets
    // When creating a TicketTypeRequest instance
    // Then it should create the instance successfully
    it('should create a TicketTypeRequest instance with valid inputs', () => {
      expect(() => new TicketTypeRequest(TicketType.ADULT, 3)).not.toThrow();
    });

    // Given an invalid ticket type
    // When creating a TicketTypeRequest instance
    // Then it should throw a TypeError
    it('should throw a TypeError for an invalid ticket type', () => {
      expect(() => new TicketTypeRequest('SENIOR', 3)).toThrow(TypeError);
    });

    // Given an invalid number of tickets (non-integer)
    // When creating a TicketTypeRequest instance
    // Then it should throw a TypeError
    it('should throw a TypeError for non-integer number of tickets', () => {
      expect(() => new TicketTypeRequest(TicketType.ADULT, 'three')).toThrow(TypeError);
    });
  });

  describe('getNoOfTickets Method', () => {
    // Given a TicketTypeRequest instance
    // When calling the getNoOfTickets method
    // Then it should return the correct number of tickets
    it('should return the correct number of tickets', () => {
      const ticketTypeRequest = new TicketTypeRequest(TicketType.CHILD, 4);
      expect(ticketTypeRequest.getNoOfTickets()).toBe(4);
    });
  });

  describe('getTicketType Method', () => {
    // Given a TicketTypeRequest instance
    // When calling the getTicketType method
    // Then it should return the correct ticket type
    it('should return the correct ticket type', () => {
      const ticketTypeRequest = new TicketTypeRequest(TicketType.INFANT, 1);
      expect(ticketTypeRequest.getTicketType()).toBe(TicketType.INFANT);
    });
  });
});
