# iOS Build Guide for Windows

This guide shows you how to build iOS deployable app files from Windows using cloud-based solutions.

## 🚀 Quick Start Options

### **Option 1: GitHub Actions (Recommended - FREE)**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add iOS build support"
   git push origin main
   ```

2. **Set up GitHub repository secrets** (if needed):
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add `APPLE_TEAM_ID` with your Apple Developer Team ID
   - Add `APPLE_CERTIFICATE` and `APPLE_CERTIFICATE_PASSWORD` for code signing

3. **Trigger the build**:
   - The workflow will run automatically on push
   - Or manually trigger from Actions tab → "Build iOS App" → Run workflow

4. **Download the app**:
   - Go to Actions tab → Click on the latest run
   - Download the "ios-app" artifact

### **Option 2: Azure DevOps**

1. **Set up Azure DevOps**:
   - Create a new project in Azure DevOps
   - Push your code to Azure Repos
   - The pipeline will run automatically

2. **Configure variables**:
   - Go to Pipelines → Edit pipeline → Variables
   - Add your Apple Developer credentials

### **Option 3: Expo EAS Build**

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure your project**:
   ```bash
   eas build:configure
   ```

4. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

## 📱 What You'll Get

After a successful build, you'll get:
- **`.ipa` file** - iOS App Store Package (for distribution)
- **`.app` file** - iOS Application Bundle (for development)
- **Build logs** - For debugging if needed

## 🔧 Prerequisites

### **For GitHub Actions/Azure DevOps**:
- Apple Developer Account (free for testing, $99/year for App Store)
- Team ID from Apple Developer portal
- Code signing certificates (optional for development builds)

### **For Expo EAS**:
- Expo account (free)
- Apple Developer Account (for App Store builds)

## 🛠️ Configuration Files

### **GitHub Actions** (`.github/workflows/ios-build.yml`)
- Automatically builds on push to main/develop
- Uses macOS runners
- Uploads artifacts for download

### **Azure DevOps** (`azure-pipelines.yml`)
- Similar to GitHub Actions
- Uses Azure's macOS agents
- Integrates with Azure DevOps ecosystem

### **Export Options** (`ios/App/exportOptions.plist`)
- Configures how the iOS app is exported
- Set to "development" for testing builds
- Change to "app-store" for App Store submission

## 📋 Build Types

### **Development Build**
- For testing on your own devices
- Requires device UDID registration
- Can be installed via TestFlight or direct installation

### **App Store Build**
- For App Store submission
- Requires proper code signing
- Must follow Apple's guidelines

## 🔍 Troubleshooting

### **Common Issues**:

1. **Code Signing Errors**:
   - Ensure your Apple Developer account is active
   - Check that Team ID is correct
   - Verify certificates are valid

2. **Build Failures**:
   - Check build logs in the cloud platform
   - Ensure all dependencies are properly installed
   - Verify Capacitor plugins are compatible

3. **Missing Dependencies**:
   - The build process automatically installs CocoaPods
   - All Capacitor plugins are synced automatically

## 📦 Distribution Options

### **TestFlight** (Recommended for testing):
1. Upload `.ipa` to App Store Connect
2. Add testers via email
3. Testers install via TestFlight app

### **Direct Installation**:
1. Use tools like Diawi or TestFlight
2. Share download link with testers
3. Testers install via Safari

### **App Store**:
1. Submit `.ipa` to App Store Connect
2. Follow Apple's review process
3. App becomes available on App Store

## 💡 Tips

1. **Start with GitHub Actions** - It's free and well-documented
2. **Use development builds first** - Faster to test and debug
3. **Keep your Apple Developer account active** - Required for all builds
4. **Test on multiple devices** - iOS apps behave differently on various devices
5. **Monitor build times** - First build takes longer, subsequent builds are faster

## 🎯 Next Steps

1. Choose your preferred build platform
2. Set up the necessary accounts and credentials
3. Push your code to trigger the first build
4. Download and test the generated `.ipa` file
5. Distribute to testers or submit to App Store

Your iOS app is now ready to be built from Windows! 🎉 