export const TicketType = Object.freeze({
  ADULT: 'ADULT',
  CHILD: 'CHILD',
  INFANT: 'INFANT',
});

export const TicketPrices = Object.freeze({
  [TicketType.ADULT]: 20,
  [TicketType.CHILD]: 10,
  [TicketType.INFANT]: 0,
});

export const MaxTicketCount = 20;
