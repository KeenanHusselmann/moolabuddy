# MoolaBuddy Security Guide

## Understanding Google Play Protect Warnings

### Why This Happens

When you install MoolaBuddy from an APK file (not from Google Play Store), Google Play Protect may show a security warning. This is normal and expected behavior for apps distributed outside the official Google Play Store.

### Why Google Play Protect Shows Warnings

1. **Unknown Source Installation**: Apps installed from APK files are considered "unknown sources"
2. **No Google Verification**: Apps not distributed through Google Play don't go through Google's security scanning
3. **Default Security Behavior**: Google Play Protect is designed to protect users from potentially malicious apps

## Solutions

### Option 1: Install from Google Play Store (Recommended)

The best solution is to install MoolaBuddy from the official Google Play Store:

1. **Search for "MoolaBuddy"** in the Google Play Store
2. **Install directly** from the store listing
3. **No security warnings** will appear

### Option 2: Trust the App (For APK Installation)

If you're installing from an APK file, you can safely trust MoolaBuddy:

#### Steps to Trust the App:

1. **When the warning appears**, tap "More details"
2. **Scroll down** and tap "Install anyway"
3. **Confirm** that you want to install the app
4. **The app will install** and work normally

#### Why MoolaBuddy is Safe:

- ✅ **Open Source**: The code is publicly available and can be reviewed
- ✅ **No Malicious Permissions**: Only requests necessary permissions for functionality
- ✅ **Local Data Storage**: All financial data stays on your device
- ✅ **No Network Tracking**: No personal data is sent to external servers
- ✅ **Standard Development**: Built using standard Android development practices

### Option 3: Disable Google Play Protect (Not Recommended)

You can temporarily disable Google Play Protect, but this is not recommended for security reasons:

1. Go to **Settings** → **Security** → **Google Play Protect**
2. Turn off **Scan apps with Play Protect**
3. **Re-enable** after installing MoolaBuddy

## Security Features in MoolaBuddy

### Built-in Security Measures:

1. **Network Security**: 
   - HTTPS-only connections
   - No cleartext traffic allowed
   - Secure certificate validation

2. **Code Protection**:
   - ProGuard obfuscation enabled
   - Code minification and optimization
   - Secure signing configuration

3. **Data Protection**:
   - Local storage only (no cloud sync)
   - No personal data collection
   - Privacy-focused design

4. **Permission Management**:
   - Minimal required permissions
   - Clear permission explanations
   - No unnecessary access requests

## Permissions Explained

MoolaBuddy requests these permissions for functionality:

- **Internet**: For AI advisor features and potential future updates
- **Notifications**: For financial reminders and budget alerts
- **Storage**: For saving receipts and exporting data
- **Camera**: For scanning receipts (optional)

## Privacy Policy

MoolaBuddy is designed with privacy in mind:

- **No Personal Data Collection**: We don't collect or store your personal information
- **Local Storage**: All your financial data stays on your device
- **No Tracking**: No analytics or tracking of your usage
- **Open Source**: Code is available for review and verification

## Troubleshooting

### If the warning persists:

1. **Check your Android version**: Some older versions may show more warnings
2. **Update Google Play Services**: Ensure you have the latest version
3. **Clear Play Store cache**: Go to Settings → Apps → Google Play Store → Clear Cache
4. **Restart your device**: Sometimes helps with permission issues

### If the app doesn't install:

1. **Enable Unknown Sources**: Go to Settings → Security → Unknown Sources
2. **Check storage space**: Ensure you have enough free space
3. **Try downloading again**: Sometimes APK files can be corrupted during download

## Support

If you continue to have issues:

1. **Check our FAQ**: Common questions and solutions
2. **Contact Support**: Email us for direct assistance
3. **Use Google Play Store**: The most reliable installation method

## Version Information

- **Current Version**: 1.0
- **Minimum Android**: 6.0 (API 23)
- **Target Android**: 14 (API 34)
- **Architecture**: ARM64, ARM, x86

---

**Note**: This guide is for educational purposes. Always use caution when installing apps from unknown sources and ensure you trust the developer. 