# Environment Setup Guide for MoolaBuddy

This guide helps you set up the Gemini API key and environment variables for the MoolaBuddy app.

## 🔑 Setting Up Gemini API Key

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Create Environment File
Create a `.env.local` file in the root directory of your project:

```bash
# .env.local
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your real API key from Google AI Studio.

### Step 3: Verify Setup
After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

## 📁 File Structure
```
moolabuddy-main/
├── .env.local          # Your API key (not committed to git)
├── .gitignore          # Excludes .env.local from git
├── vite.config.ts      # Environment variable configuration
└── services/
    └── geminiService.ts # Uses the API key
```

## 🔧 Configuration Details

### Vite Configuration (`vite.config.ts`)
The app supports both `API_KEY` and `GEMINI_API_KEY` environment variables:

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY)
}
```

### Gemini Service (`services/geminiService.ts`)
The service checks for both environment variables:

```typescript
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
```

## 🚨 Troubleshooting

### Issue: "API_KEY environment variable not set"
**Solution:** Create the `.env.local` file with your API key

### Issue: "Gemini API calls will be disabled"
**Solution:** Ensure your API key is correctly set in `.env.local`

### Issue: API calls failing
**Solutions:**
1. Verify your API key is valid
2. Check your internet connection
3. Ensure you have sufficient API quota

## 🔒 Security Notes

- ✅ `.env.local` is automatically excluded from git
- ✅ API key is only used client-side for Gemini API calls
- ✅ No sensitive data is stored in the app
- ✅ Environment variables are properly sanitized

## 🧪 Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the console** for any API key warnings

3. **Test AI features** in the app:
   - Financial insights
   - Projection analysis
   - Content recommendations

## 📱 Mobile App Configuration

### Android
The environment variables are automatically included in the Android build.

### iOS
The environment variables are automatically included in the iOS build.

## 🔄 Updating API Key

If you need to update your API key:

1. **Update `.env.local`:**
   ```bash
   GEMINI_API_KEY=your_new_api_key_here
   ```

2. **Restart the development server:**
   ```bash
   npm run dev
   ```

3. **Rebuild mobile apps:**
   ```bash
   npm run build
   npx cap sync
   ```

## 📊 API Usage

The app uses Gemini API for:
- ✅ Financial insights and analysis
- ✅ Projection calculations
- ✅ Content recommendations
- ✅ Personalized financial tips

## 🎯 Next Steps

1. Create your `.env.local` file with your API key
2. Restart the development server
3. Test the AI features in the app
4. Build and test on mobile devices

Your MoolaBuddy app is now ready to use AI-powered financial insights! 🎉 