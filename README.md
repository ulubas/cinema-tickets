# Cinema Tickets JavaScript

## Project Description

This project is a cinema ticket booking system implemented in JavaScript. It provides functionalities to book tickets, reserve seats, and process payments.

## Features

- Ticket Booking: Allows users to book tickets for various movies.
- Seat Reservation: Enables users to reserve their preferred seats.
- Payment Gateway: Facilitates payment transactions securely.

## Installation

To get the project up and running on your local machine, follow these steps:

1. Clone the repository:
   
   ```sh
   git clone <link>
   ```

2. Navigate to the project directory:

   ```sh
   cd cinema-tickets-javascript
   ```

3. Install the necessary packages:

   ```sh
   npm install
   ```

## Testing

This project uses Jest for unit testing. To run the tests, use the following command:

```sh
npm test
```

## Linting and Formatting

We use ESLint for linting and Prettier for code formatting. To lint your code, use:

```sh
npm run lint
```

To auto-fix linting errors, use:

```sh
npm run lint-fix
```

To format your code, use:

```sh
npm run format
```

## Pre-commit Hooks

We use Husky and lint-staged to set up pre-commit hooks. These hooks ensure code quality by running lint and format scripts before each commit.
