# 💰 MoolaBuddy - Your Smart Finance Buddy

MoolaBuddy is a comprehensive financial management mobile application built with React, TypeScript, and Capacitor. It features AI-powered financial advice, expense tracking, goal setting, and comprehensive financial tools to help users manage their money effectively.

## ✨ Features

- 🤖 **AI Financial Advisor** - Get personalized financial advice using Google's Gemini AI
- 📊 **Dashboard** - Comprehensive overview of your financial status
- 💳 **Transaction Management** - Track and categorize your expenses and income
- 🎯 **Goal Setting** - Set and track your financial goals
- 📱 **Receipt Scanner** - Capture and organize receipts using device camera
- 🛒 **Shopping Lists** - Manage your shopping with budget tracking
- 📈 **Financial Projections** - Visualize your financial future
- 🏪 **Store Management** - Track spending by store/merchant
- 📝 **Notes** - Keep financial notes and reminders
- 🔔 **Notifications** - Stay on top of your financial goals

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/moolabuddy.git
   cd moolabuddy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the web development server:**
   ```bash
   npm run dev
   ```

## 📱 Mobile Development

### Android APK Build

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

3. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleDebug  # For debug APK
   ./gradlew assembleRelease  # For release APK
   ```

   Or use the convenient build script:
   ```bash
   ./build-apk.ps1
   ```

**APK Output Locations:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### iOS Development

1. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

2. **Build from Xcode** or use command line tools for iOS deployment.

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run build:android` - Build and sync for Android
- `npm run android:dev` - Build, sync, and run on Android device
- `npm run android:open` - Open Android project in Android Studio
- `npm run build:ios` - Build and sync for iOS
- `npm run ios:dev` - Build, sync, and run on iOS device
- `npm run ios:open` - Open iOS project in Xcode

## 🏗 Technology Stack

- **Frontend:** React 18, TypeScript
- **Build Tool:** Vite
- **Mobile Framework:** Capacitor 7
- **AI Integration:** Google Gemini API
- **Charts:** Recharts
- **File Processing:** XLSX library
- **Mobile Features:** Camera, File System, Local Notifications

## 📁 Project Structure

```
moolabuddy/
├── components/           # React components
│   ├── icons/           # Custom SVG icons
│   └── ...              # Feature components
├── services/            # API and service integrations
├── android/             # Android platform files
├── ios/                 # iOS platform files
├── public/              # Static assets
└── src/                 # Additional source files
```

## 🔧 Build Requirements

### Android
- **Java:** Version 21 (Android Studio's bundled JDK recommended)
- **Android SDK:** API Level 23-35
- **Gradle:** 8.x (included via wrapper)

### iOS
- **Xcode:** Latest version
- **iOS:** 13.0+
- **CocoaPods:** For dependency management

## 📖 Documentation

- [Android Deployment Guide](ANDROID_DEPLOYMENT.md)
- [iOS Build Guide](IOS_BUILD_GUIDE.md)
- [User Manual](MOOLABUDDY_USER_MANUAL.md)
- [Security Guide](SECURITY_GUIDE.md)
- [Environment Setup](ENV_SETUP_GUIDE.md)

## 🔐 Security

- API keys are stored in environment variables
- Local data encryption for sensitive financial information
- Secure HTTPS communication with external services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent financial advice
- Capacitor team for excellent cross-platform framework
- React and Vite communities for amazing development tools

---

**Made with ❤️ for better financial management**
