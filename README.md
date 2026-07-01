# AniXen

A modern, feature-rich anime streaming platform built with React, TypeScript, and Tailwind CSS.

![AniXen](https://via.placeholder.com/1200x600/0a0a0a/ff4444?text=AniXen)

## Features

### Streaming
- **Dual Provider Support**: AnimeHeaven (primary) + Senshi (fallback)
- **Sub & Dub**: Watch anime in Japanese with subtitles or English dub
- **Auto-fallback**: Seamlessly switches between providers if one fails
- **Quality Selection**: Choose from available video qualities

### Watch Order
- **Comprehensive Database**: Integrated with Anime Watch Order API
- **Visual Timeline**: See the correct viewing order for complex series
- **Direct Navigation**: Jump directly to any anime in the watch order

### Community
- **Comments System**: Leave comments on any anime
- **GIF Support**: Express yourself with animated GIFs
- **Emoji Reactions**: 30+ emojis to choose from
- **Reply System**: Engage in conversations

### User Features
- **Bookmark System**: Save your favorite anime
- **Watch History**: Track your viewing progress
- **Custom Avatars**: Choose from 25+ anime-themed avatars
- **Profile Management**: Customize your experience

### UI/UX
- **Entry Page**: Immersive landing with background video
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes for late-night sessions
- **Smooth Animations**: Polished transitions throughout

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Routing**: React Router v7
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/anixen.git

# Navigate to project directory
cd anixen

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── anime/          # Anime-related components
│   │   ├── AnimeCard.tsx
│   │   ├── AnimeGrid.tsx
│   │   ├── EpisodeList.tsx
│   │   ├── HeroCarousel.tsx
│   │   └── WatchOrder.tsx
│   ├── auth/           # Authentication modals
│   ├── comments/       # Comment system
│   ├── layout/         # Layout components
│   ├── player/         # Video player
│   ├── profile/        # Profile features
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API clients
│   ├── providers/      # Streaming providers
│   │   ├── animeheaven.ts
│   │   ├── senshi.ts
│   │   └── streaming-manager.ts
│   ├── firebase.ts
│   └── watch-order.ts
├── pages/              # Route pages
├── types/              # TypeScript types
└── App.tsx             # Main app component
```

## Streaming Providers

### AnimeHeaven (Primary)
- Free anime streaming
- Sub support
- High-quality video sources

### Senshi (Fallback)
- Sub & Dub support
- Multiple server options
- MAL ID fallback search

## Features in Detail

### Watch Order System
The watch order feature helps viewers watch anime in the correct chronological or recommended order. This is especially useful for complex series like:
- Monogatari Series
- Fate Series
- JoJo's Bizarre Adventure
- Gundam Timeline

### Comment System
- **Real-time**: Comments appear instantly
- **Rich Media**: Support for GIFs and emojis
- **Threaded**: Reply to other comments
- **Persistent**: Comments saved locally (expandable to Firebase)

### Custom Avatars
Choose from 25+ anime-themed avatars including characters from:
- Dragon Ball Z
- One Piece
- Bleach
- Jujutsu Kaisen
- Spy x Family

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

AniXen does not host any video content. All streaming content is sourced from third-party providers. This project is for educational purposes only.

## Acknowledgments

- [Jikan API](https://jikan.moe/) - MyAnimeList API
- [Anime Watch Order API](https://github.com/Bas1874/Anime-Watch-Order-Api)
- [AnimeHeaven](https://animeheaven.me/) - Streaming provider
- [Senshi](https://senshi.live/) - Streaming provider
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

Made with ❤️ by AniXen Team
