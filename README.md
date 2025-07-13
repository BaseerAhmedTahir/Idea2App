# Idea2App

This project is a web application built with React, TypeScript, Vite, and Tailwind CSS. It features AI-powered code generation, live preview, authentication, and export capabilities.

## Features
- AI-powered code generation
- Live preview of generated code
- Authentication modal
- Export section for generated code
- Feature customization and parsing
- Project management hooks
- Supabase integration

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/Idea2App.git
   cd Idea2App
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

### Build for Production
```sh
npm run build
# or
yarn build
```

### Deployment
You can deploy the build output from the `dist` folder to any static hosting service (e.g., Vercel, Netlify, GitHub Pages).

## Folder Structure
- `src/` - Main source code
- `services/` - API and backend service integrations
- `lib/` - Utility libraries (e.g., Supabase)
- `supabase/` - Database migrations

## How It Works

Idea2App lets you generate a fully functional website or prototype by simply entering a prompt describing your app idea. The built-in AI analyzes your prompt, extracts features, and automatically generates code for the frontend, backend, database, tests, and deployment configuration. You can preview the generated app live, customize features, and export the code for deployment.

### Workflow
1. Enter your app idea in the prompt box.
2. The AI assistant analyzes your idea and extracts key features.
3. Review and customize the features as needed.
4. The app generates code for all major components.
5. Preview the generated app live in the browser.
6. Export the code or deploy it to your preferred platform.
