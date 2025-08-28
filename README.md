# TypeScript Project

A well-structured TypeScript project with modern development practices and tooling.

## Features

- 🚀 **TypeScript** - Strict type checking with modern ES2020+ features
- 🧹 **ESLint** - Code linting with TypeScript-specific rules
- 💄 **Prettier** - Consistent code formatting
- 🧪 **Jest** - Comprehensive testing framework with TypeScript support
- 🔄 **Hot Reload** - Development server with auto-restart on changes
- 📦 **Modern Build** - Optimized build process with source maps
- 🎯 **Best Practices** - Follows TypeScript and Node.js best practices

## Project Structure

```
├── src/
│   ├── __tests__/          # Test files
│   ├── utils/              # Utility functions
│   └── index.ts            # Main entry point
├── dist/                   # Compiled output (generated)
├── coverage/               # Test coverage reports (generated)
├── .github/
│   └── copilot-instructions.md
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest testing configuration
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
└── package.json            # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

Watch mode for development:

```bash
npm run dev:watch
```

### Building

Build the project for production:

```bash
npm run build
```

Watch mode for building:

```bash
npm run build:watch
```

### Running

After building, run the compiled application:

```bash
npm start
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage report:

```bash
npm run test:coverage
```

## Code Quality

### Linting

Check for linting errors:

```bash
npm run lint
```

Fix linting errors automatically:

```bash
npm run lint:fix
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

Check if code is properly formatted:

```bash
npm run format:check
```

## Available Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run build`         | Compile TypeScript to JavaScript     |
| `npm run build:watch`   | Compile in watch mode                |
| `npm start`             | Run the compiled application         |
| `npm run dev`           | Run TypeScript directly with ts-node |
| `npm run dev:watch`     | Run in development with auto-restart |
| `npm test`              | Run Jest tests                       |
| `npm run test:watch`    | Run tests in watch mode              |
| `npm run test:coverage` | Generate test coverage report        |
| `npm run lint`          | Check code with ESLint               |
| `npm run lint:fix`      | Fix ESLint errors automatically      |
| `npm run format`        | Format code with Prettier            |
| `npm run format:check`  | Check code formatting                |
| `npm run clean`         | Remove build artifacts               |

## Configuration

### TypeScript

The project uses a strict TypeScript configuration with:

- Target: ES2020
- Strict type checking enabled
- Source maps and declarations generated
- Modern module resolution

### ESLint

Configured with:

- TypeScript-specific rules
- Prettier integration
- Recommended best practices

### Jest

Set up for TypeScript with:

- ts-jest preset
- Coverage reporting
- Test file patterns for `__tests__` directory and `.test.ts` files

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass
4. Run linting and formatting checks
5. Update documentation as needed

## License

MIT
