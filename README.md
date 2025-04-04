# WEX IQ - Next-Generation Fleet Management Dashboard

![WEX IQ Dashboard](/public/wex-dashboard-preview.png)

This prototype demonstrates a futuristic vision of the WEX Online platform, reimagined for 2025 and beyond. The application integrates advanced AI assistance, real-time fleet management, and interactive financial controls in a seamless, conversation-driven interface.

## Key Features

### WEX IQ - AI Assistant
- **Conversational Interface**: Natural language interaction with an AI assistant that understands fleet management context and user needs
- **Voice Interaction**: Full speech-to-text and text-to-speech capabilities for hands-free operation
- **Real-time Transcription**: Live transcription of user speech for immediate feedback
- **Contextual Understanding**: The assistant maintains conversation context and can reference previous interactions

### Interactive UI Components
- **In-Chat UI Elements**: Interactive components like purchase controls and statement summaries appear directly within the conversation flow
- **Dynamic Purchase Controls**: Adjust spending limits, location restrictions, and time periods with intuitive controls
- **Statement Management**: View and interact with financial statements without leaving the conversation context

### Fleet Management Dashboard
- **Real-time Activity Monitoring**: Track fleet activity, spending, and transaction history
- **Transaction Insights**: Visual breakdowns of spending patterns and category distributions
- **Proactive Alerts**: Get notified about unusual spending, maintenance needs, and optimization opportunities

## Technology Stack

- **Frontend**: Next.js with TypeScript and React
- **Styling**: TailwindCSS for responsive design
- **AI Integration**: OpenAI Realtime API for voice and conversation capabilities
- **State Management**: React hooks and context for application state
- **UI Components**: Custom components built with accessibility in mind

## Setup

- Install dependencies with `npm install`
- Add your `OPENAI_API_KEY` to your `.env.local` file
- Start the development server with `npm run dev`
- Open your browser to [http://localhost:3000](http://localhost:3000) to experience the prototype

## User Experience

### Dashboard Overview
The main dashboard provides a comprehensive view of fleet operations, with cards for quick access to key metrics and recent activity. The sidebar navigation allows users to access different sections of the application.

### WEX IQ Assistant
The AI assistant is accessible through a chat window that can be toggled from any screen. Users can interact with WEX IQ through:
- Text input
- Voice commands (with real-time transcription)
- Quick action buttons for common tasks

### Interactive Features

#### Purchase Controls
Users can create and manage purchase control profiles with:
- Date range selection via an interactive calendar
- Location and radius settings with autofill capabilities
- Spending limits adjustable through an intuitive slider
- Category selection for permitted purchase types

#### Statement Management
The statement summary interface provides:
- Visual breakdown of spending by category
- Savings highlights and opportunities
- Quick access to payment options
- Downloadable statement formats

## Agent Configuration

The WEX IQ assistant is powered by a sophisticated agent system defined in `src/app/agentConfigs/wexAgents.ts`. The agent is configured to:

- Understand fleet management terminology and concepts
- Provide contextual assistance based on user role and permissions
- Trigger appropriate UI components based on conversation context
- Handle complex queries about transactions, spending patterns, and account management

The agent can be customized further by modifying its configuration and adding specialized tools for specific fleet management tasks.

## Future Roadmap

This prototype represents an initial vision for the future of WEX Online. Planned enhancements include:

- **Predictive Analytics**: AI-powered forecasting of fuel prices and spending patterns
- **Maintenance Scheduling**: Intelligent maintenance recommendations based on vehicle usage patterns
- **Enhanced Authorization Controls**: More granular control over purchase authorizations with multi-factor approval workflows
- **Mobile Companion App**: Synchronized experience between desktop and mobile interfaces
- **AR/VR Integration**: Immersive data visualization for complex fleet analytics

## Getting Involved

This prototype is designed to gather feedback and inspire discussion about the future of fleet management interfaces. We welcome:

- Feature suggestions
- Usability feedback
- Integration ideas
- Design enhancements

## Acknowledgments

This prototype builds upon the OpenAI Realtime API framework and incorporates design principles from modern enterprise UX research. Special thanks to the WEX design and product teams for their vision and guidance.

---

© 2025 WEX Inc. | This is a prototype for demonstration purposes only.
