# MoolaBuddy Android Deployment Guide

## Prerequisites

1. **Android Studio** - Download and install from [https://developer.android.com/studio](https://developer.android.com/studio)
2. **Android SDK** - Install through Android Studio
3. **Java Development Kit (JDK)** - Version 11 or higher
4. **Node.js** - Version 16 or higher

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Web App
```bash
npm run build
```

### 3. Sync with Capacitor
```bash
npx cap sync
```

### 4. Open in Android Studio
```bash
npx cap open android
```

## Development Workflow

### Quick Development Commands
```bash
# Build and sync for Android
npm run build:android

# Build, sync, and run on device/emulator
npm run android:dev

# Open Android Studio
npm run android:open
```

### Live Reload Development
```bash
# Start the web development server
npm run dev

# In another terminal, run the Android app
npx cap run android
```

## Building for Production

### 1. Generate Release APK
1. Open Android Studio
2. Go to `Build` → `Generate Signed Bundle / APK`
3. Choose `APK`
4. Create a new keystore or use existing one
5. Fill in the certificate details
6. Choose `release` build variant
7. Build the APK

### 2. Generate AAB (Android App Bundle)
1. Follow the same steps as APK generation
2. Choose `Android App Bundle` instead of `APK`
3. This is the recommended format for Google Play Store

## Google Play Store Deployment

### 1. Create Developer Account
- Sign up at [Google Play Console](https://play.google.com/console)
- Pay the one-time $25 registration fee

### 2. Prepare Store Listing
- App name: "MoolaBuddy"
- Short description: "Your Smart Finance Buddy"
- Full description: Detailed app description
- Screenshots: Take screenshots from different screen sizes
- Feature graphic: 1024x500px banner image
- App icon: 512x512px icon

### 3. Upload Build
1. Generate signed AAB file
2. Upload to Google Play Console
3. Set up release track (internal testing, closed testing, or production)
4. Submit for review

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Make sure Android Studio is up to date
   - Clean and rebuild project: `./gradlew clean`
   - Sync project with Gradle files

2. **Permission Issues**
   - Check `AndroidManifest.xml` for required permissions
   - Ensure all Capacitor plugins are properly configured

3. **App Not Loading**
   - Check network connectivity
   - Verify API keys are properly configured
   - Check browser console for errors

### Debug Commands
```bash
# Check Capacitor status
npx cap doctor

# List installed plugins
npx cap ls

# Sync specific platform
npx cap sync android
```

## Configuration Files

### capacitor.config.ts
- Main Capacitor configuration
- Defines app ID, name, and web directory
- Configures plugins and server settings

### Android Manifest
- Located at `android/app/src/main/AndroidManifest.xml`
- Defines app permissions and activities
- Configure app theme and launch behavior

## Performance Optimization

1. **Bundle Size**
   - Use code splitting with dynamic imports
   - Optimize images and assets
   - Enable compression in build

2. **Runtime Performance**
   - Minimize DOM manipulations
   - Use efficient state management
   - Implement lazy loading

3. **Memory Management**
   - Clean up event listeners
   - Dispose of unused resources
   - Monitor memory usage

## Security Considerations

1. **API Keys**
   - Store sensitive keys securely
   - Use environment variables
   - Never commit keys to version control

2. **Network Security**
   - Use HTTPS for all API calls
   - Implement certificate pinning if needed
   - Validate server responses

3. **Data Protection**
   - Encrypt sensitive user data
   - Implement secure storage
   - Follow GDPR/privacy guidelines

## Testing

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] All navigation works correctly
- [ ] Forms submit properly
- [ ] Data persists between sessions
- [ ] Notifications work (if implemented)
- [ ] App handles network errors gracefully
- [ ] UI is responsive on different screen sizes

### Automated Testing
```bash
# Run unit tests
npm test

# Run E2E tests (if configured)
npm run test:e2e
```

## Updates and Maintenance

### Updating Capacitor
```bash
npm update @capacitor/core @capacitor/cli @capacitor/android
npx cap sync
```

### Updating Dependencies
```bash
npm update
npx cap sync
```

### Version Management
- Update version in `package.json`
- Update version code in `android/app/build.gradle`
- Tag releases in Git

## Support

For issues related to:
- **Capacitor**: [Capacitor Documentation](https://capacitorjs.com/docs)
- **Android Development**: [Android Developer Guide](https://developer.android.com/guide)
- **Google Play Console**: [Play Console Help](https://support.google.com/googleplay/android-developer)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 