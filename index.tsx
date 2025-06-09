
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // This error should ideally be caught by the application's own logging if it occurs.
    // If React's error #310 is hit, it implies this check passed, which is contradictory.
    // However, this check is good practice.
    console.error("Life Architect critical error: Could not find root element with id='root' to mount to. Ensure it exists in your index.html.");
    // Display a user-friendly message on the page itself
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center; color: red;">
        <h1>Application Initialization Error</h1>
        <p>The application could not start because a critical part of the page (id='root') was not found.</p>
        <p>Please ensure you are using a modern browser and that no scripts are blocking page content. If the problem persists, please contact support.</p>
      </div>
    `;
    // Throwing an error here will stop further execution.
    throw new Error("Root element #root not found in DOM. Application cannot start.");
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Life Architect critical error: Failed to render React application.", error);
    // Attempt to display an error message to the user within the rootElement if it exists and is usable,
    // or fallback to document.body if rendering itself fails catastrophically.
    const displayErrorInElement = rootElement.parentNode ? rootElement : document.body; // Check if rootElement is still in document
    displayErrorInElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center; color: red;">
        <h1>Application Render Error</h1>
        <p>An unexpected error occurred while trying to display the application.</p>
        <p>Details: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Please try refreshing the page. If the problem persists, please contact support.</p>
      </div>
    `;
    // Re-throw or handle as appropriate for the application's error strategy
    // For a client-side app, re-throwing might be useful for global error handlers or developer tools.
    throw error; 
  }
});
