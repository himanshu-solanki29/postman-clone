# Postman Clone

A sleek, modern Postman-like API client built with React, TypeScript, and Tailwind CSS. This application allows you to make API requests, view responses, and save request history.

![image](https://github.com/user-attachments/assets/85feb2cf-6785-45fb-bfbb-d6f3e99072b5)
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/12c9b1db-427c-4f67-9192-7c15bf60c84c" />

## Features

- 🚀 Send API requests with various HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- 📋 Tabbed interface for managing multiple requests simultaneously
- 📦 Request builder with headers and body editors
- 🔍 Response viewer with formatted response body and headers
- ⏱️ Response time tracking
- 📊 Status code visualization
- 📜 Request history tracking
- 🍎 macOS style interface with modern UI elements

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Axios for HTTP requests
- Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/postman-clone.git
cd postman-clone
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Creating a new request tab**: Click the + button in the tab bar
2. **Sending a request**: 
   - Select an HTTP method (GET, POST, etc.)
   - Enter a URL
   - Configure headers and body if needed
   - Click the Send button
3. **Viewing the response**: The response will appear in the lower panel showing:
   - Status code
   - Response time
   - Response headers
   - Formatted response body
4. **Managing tabs**: Close tabs using the X button, switch between tabs by clicking them

## Application Structure

- `src/`
  - `components/`: Reusable UI components
  - `context/`: React context providers for state management
  - `pages/`: Main application pages
  - `types/`: TypeScript type definitions
  - `App.tsx`: Main application component
  - `main.tsx`: Application entry point

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by [Postman](https://www.postman.com/)
- UI styled after macOS interfaces
