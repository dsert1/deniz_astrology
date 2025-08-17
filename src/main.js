import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import posthog from 'posthog-js'

// Initialize PostHog on the client
// Make sure you have VITE_PUBLIC_POSTHOG_KEY and VITE_PUBLIC_POSTHOG_HOST defined in your .env
posthog.init(
  import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
  {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true
  }
)

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
