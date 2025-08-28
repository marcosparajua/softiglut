<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# TypeScript Project Guidelines

This is a TypeScript project following best practices. When working on this codebase:

## Code Style

- Use strict TypeScript configuration with explicit types
- Follow ESLint and Prettier formatting rules
- Write comprehensive JSDoc comments for all functions
- Use meaningful variable and function names

## Testing

- Write unit tests for all functions using Jest
- Place tests in the `__tests__` directory or use `.test.ts` suffix
- Aim for high test coverage
- Test both happy path and error scenarios

## Project Structure

- Keep source code in the `src/` directory
- Use the `utils/` subdirectory for reusable utility functions
- Build output goes to `dist/` directory
- Follow the established folder structure

## Development Workflow

- Use `npm run dev` for development with auto-restart
- Use `npm run build` to compile TypeScript
- Use `npm run test` to run the test suite
- Use `npm run lint` to check code quality
- Use `npm run format` to format code

## Best Practices

- Always handle error cases appropriately
- Use async/await for asynchronous operations
- Prefer composition over inheritance
- Keep functions small and focused on a single responsibility
