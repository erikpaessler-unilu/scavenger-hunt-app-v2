# Deployment Guide for Quest Finder

## Vercel Deployment

This app is configured to deploy on Vercel with the correct build settings.

### Quick Deploy

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings from `vercel.json`
   - Click "Deploy"

### Build Configuration

The following files have been configured for deployment:

#### `vercel.json`
- Specifies `dist` as the output directory
- Configures SPA routing (all routes → index.html)
- Sets build and install commands

#### `vite.config.ts`
- Configures Vite to output to `dist` directory
- Optimizes build for production

#### `package.json`
- Contains all dependencies
- Defines build scripts: `npm run build`

### Manual Configuration (if needed)

If you need to configure Vercel manually:

1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### Environment Variables

No environment variables are required for this app as it uses localStorage for data persistence.

### Post-Deployment

After deployment:
1. Visit your deployed URL
2. Test login with tokens:
   - Student: `student`
   - Creator: `creator123`
3. Verify location permissions work in your browser
4. Test creating and playing hunts

### Important Notes

- **localStorage**: All data (progress, hunts, leaderboard) is stored in browser localStorage
- **No Backend Required**: This is a pure frontend app
- **No Database**: For production with real multi-user features, consider adding Supabase
- **HTTPS Required**: Geolocation API requires HTTPS (Vercel provides this automatically)

### Troubleshooting

**"No Output Directory" Error**:
- Ensure `vercel.json` exists in root
- Verify `outputDirectory` is set to `dist`
- Check that build command runs successfully locally: `npm run build`

**Build Fails**:
- Run `npm install` locally first
- Check that all imports are correct
- Verify `package.json` has all dependencies

**Blank Page After Deploy**:
- Check browser console for errors
- Verify `index.html` and `main.tsx` exist
- Check that routing is configured in `vercel.json`

**Geolocation Not Working**:
- Ensure deployed site uses HTTPS (Vercel does this automatically)
- Check browser permissions for location access
- Test on different browsers/devices

### Local Development

To test locally before deploying:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (test build)
npm run build

# Preview production build
npm run preview
```

### Alternative Deployment Platforms

This app can also be deployed to:
- **Netlify**: Use same build settings
- **GitHub Pages**: May require additional routing configuration
- **Cloudflare Pages**: Compatible with Vite projects
- **AWS Amplify**: Supports SPA routing

For any platform, ensure:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing enabled (redirect all routes to index.html)
