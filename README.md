# English to Hindi Translator Website with Night Mode

A beautiful and interactive web application that translates English words to Hindi, displays their pronunciation in Devanagari script, and provides romanized pronunciation guides with free API integration and stunning dark/light theme support.

## 🌟 New Features in v2.1

### 🌙 Night Mode
- **Theme Toggle**: Beautiful animated switch between light and dark modes
- **System Preference**: Automatically detects and follows system dark mode
- **Smooth Transitions**: All elements transition smoothly between themes
- **Enhanced Dark UI**: Specially designed dark theme with improved contrast
- **Keyboard Shortcut**: Press `Ctrl+D` (or `Cmd+D` on Mac) to toggle themes
- **Memory**: Remembers your theme preference across sessions

### ✨ Enhanced UI/UX
- **Animated Transitions**: Smooth animations for all interactions
- **Better Loading States**: Enhanced loading animations and feedback
- **Notification System**: Toast notifications for user feedback
- **Ripple Effects**: Material Design-inspired button animations
- **Scroll Animations**: Elements animate in as you scroll
- **Enhanced Accessibility**: Better keyboard navigation and screen reader support

## 🌐 All Features

- 🌙 **Dark/Light Mode**: Toggle between beautiful themes with smooth transitions
- 🌐 **Real-time Translation**: Translate English words to Hindi instantly using free APIs
- 📝 **Devanagari Script**: Display Hindi translations in authentic Devanagari script  
- 🔊 **Audio Pronunciation**: Listen to Hindi pronunciations using text-to-speech
- 🎯 **Romanized Guide**: Get romanized pronunciation for easier learning
- 📚 **Translation History**: Keep track of your recent translations (stored locally)
- 💫 **Popular Words**: Quick access to commonly translated words
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Offline Support**: Pre-loaded with 35+ common word translations
- 🆓 **Free API Integration**: Uses MyMemory and LibreTranslate APIs
- 🎨 **Modern UI**: Beautiful gradients, animations, and interactive elements
- ⌨️ **Keyboard Shortcuts**: Convenient keyboard navigation
- 🔔 **Smart Notifications**: User-friendly feedback system

## 🚀 Technologies Used

- **HTML5**: Semantic markup with enhanced accessibility
- **CSS3**: Advanced styling with CSS variables, gradients, and animations
- **Vanilla JavaScript**: ES6+ with modern async/await and classes
- **Google Fonts**: Noto Sans Devanagari for authentic Hindi display
- **Web APIs**: Speech Synthesis, Local Storage, Intersection Observer
- **MyMemory Translation API**: Free translation service (1000 requests/day)
- **LibreTranslate API**: Open-source translation fallback
- **CSS Variables**: Dynamic theming system for dark/light modes

## 📁 Project Structure

```
english-to-hindi-translator/
├── index.html          # Main HTML file with theme toggle
├── styles.css          # Complete CSS with dark/light theme support
├── script.js           # Enhanced JavaScript with theme management
└── README.md          # This comprehensive documentation
```

## 🛠️ Installation & Setup

1. **Download Files**: Clone or download all files to the same directory
2. **Open in Browser**: Double-click `index.html` or serve via local server
3. **Internet Connection**: Required for API translations (offline words work without internet)
4. **Modern Browser**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+

### Local Development Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000

# Using Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

## 🌙 Theme System

### Auto Theme Detection
The app automatically detects your system's dark mode preference and applies the appropriate theme on first visit.

### Manual Theme Toggle
- **Header Toggle**: Click the sun/moon toggle in the header
- **Keyboard Shortcut**: Press `Ctrl+D` (Windows/Linux) or `Cmd+D` (Mac)
- **Theme Persistence**: Your choice is saved and remembered across sessions

### CSS Variables System
```css
:root {
    /* Light mode variables */
    --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --text-primary: #333333;
    /* ... more variables */
}

[data-theme="dark"] {
    /* Dark mode variables */
    --bg-primary: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    --text-primary: #e2e8f0;
    /* ... more variables */
}
```

## 💻 Complete Code Implementation

### HTML Structure
- **Theme Toggle**: Animated switch in header
- **Semantic Markup**: Proper ARIA labels and roles
- **Enhanced Navigation**: Better keyboard accessibility

### CSS Styling
- **CSS Custom Properties**: Dynamic theming system
- **Advanced Animations**: Keyframes for smooth transitions
- **Responsive Grid**: Modern CSS