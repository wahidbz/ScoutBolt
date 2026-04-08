# ScoutBolt 🎮🔩

A production-ready 2D wood puzzle game for mobile browsers with Pi Network SDK integration.

![Game Screenshot](assets/images/screenshot.png)

## 🎯 Features

- **10 Progressive Levels** - From tutorial to master challenge
- **Physics-Based Gameplay** - Realistic falling plates with gravity and rotation
- **Strategic Mechanics** - Locked bolts, dependency chains, order matters
- **Pi SDK Integration** - Ready for Pi Network authentication and payments
- **Mobile Optimized** - Touch controls, responsive design, Pi Browser compatible
- **Modular Architecture** - Clean separation of concerns, easy to extend
- **Local Progress** - localStorage with Pi SDK upgrade path
- **Visual Effects** - Particle systems, smooth animations, wood textures

## 🚀 Quick Start

1. **Download** or clone this repository
2. **Open** `index.html` in any modern browser
3. **Play** immediately - no build step required

For Pi Browser deployment:
1. Register your app at [Pi Developer Portal](https://develop.pi)
2. Update `CONFIG.PI.APP_ID` in `js/config.js`
3. Deploy to your server
4. Configure Development URL in Developer Portal

## 📁 Project Structure

```
scoutbolt/
├── index.html              # Main entry point
├── css/
│   └── style.css          # All styles with CSS variables
├── js/
│   ├── main.js            # Entry point, initialization
│   ├── config.js          # Constants and configuration
│   ├── levels.js          # Level data (10 levels)
│   ├── game.js            # Core game logic + Pi SDK
│   ├── ui.js              # UI management
│   ├── storage.js         # localStorage + Pi storage
│   ├── audio.js           # Web Audio API sounds
│   ├── physics.js         # Physics engine
│   ├── renderer.js        # Canvas rendering
│   ├── input.js           # Touch/mouse input
│   └── particles.js       # Particle system
└── assets/
    ├── images/            # (empty - all assets generated in code)
    └── sounds/            # (empty - synthesized audio)
```

## 🎮 Game Mechanics

### Basic Rules
1. **Tap bolts** to remove them
2. **Remove all bolts** from a plate to make it fall
3. **Target plate** (usually top/last) must fall to win
4. **Order matters** - some bolts unlock others

### Special Mechanics
- **Locked Bolts** (red with 🔒) - Unlock after certain moves
- **Support System** - Some plates hold up others
- **Chain Reactions** - Falling plates can knock down others

### Scoring
- ⭐⭐⭐ - 3 moves or less (perfect)
- ⭐⭐ - 5 moves or less (great)
- ⭐ - 10 moves or less (completed)

## 🔧 Pi SDK Integration

The game includes full Pi SDK integration ready for deployment:

### Authentication
```javascript
// Automatic on load if Pi SDK detected
Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
```

### Payments
```javascript
// Create payment for hints/unlocks
Game.createPayment('hint');     // 0.1 Pi
Game.createPayment('unlock');   // 0.5 Pi
Game.createPayment('premium');  // 1.0 Pi
```

### Server-Side Requirements
Backend endpoints needed for Pi payments:
- `POST /api/payments/approve` - Approve payment
- `POST /api/payments/complete` - Complete payment
- `POST /api/payments/incomplete` - Handle incomplete payments

See [Pi Platform Docs](https://github.com/pi-apps/pi-platform-docs) for details.

## 🛠️ Development

### Adding New Levels
Edit `js/levels.js`:
```javascript
{
    id: 11,
    name: "New Level",
    plates: [
        {
            x: 100, y: 200, width: 200, height: 80,
            color: '#8b6f47',
            bolts: [
                { x: 140, y: 240 },
                { x: 260, y: 240, locked: true, unlocksAfter: 1 }
            ],
            supports: [1] // Supports plate index 1
        }
    ]
}
```

### Customizing Styles
Edit CSS variables in `css/style.css`:
```css
:root {
    --color-gold: #d4a853;
    --color-wood-dark: #4a3728;
    --shadow-medium: 0 6px 20px rgba(0,0,0,0.4);
}
```

### Enabling Debug Mode
Edit `js/config.js`:
```javascript
DEBUG: {
    ENABLED: true,
    SHOW_FPS: true,
    LOG_LEVEL: 'debug'
}
```

## 📱 Mobile Optimization

- **Touch targets** - Minimum 44px hit areas
- **Viewport** - Fixed, no zoom, no scroll
- **Orientation** - Handles rotation changes
- **Performance** - 60fps on mid-range devices
- **Pi Browser** - Fully compatible

## 🔒 Security Notes

1. **Frontend data is untrusted** - Always verify on backend
2. **Access tokens expire** - Use `/me` endpoint for verification
3. **Payments require server approval** - Never trust client-side completion
4. **UID is app-specific** - Different apps see different UIDs for same user

## 📝 License

MIT License - feel free to use for commercial or personal projects.

## 🙏 Credits

- Built for Pi Network ecosystem
- Wood texture inspiration from classic carpentry
- Sound synthesis via Web Audio API

---

**Made with ❤️ for Pi Pioneers**
