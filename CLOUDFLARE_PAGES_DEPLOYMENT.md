# Deploy OptiPix to Cloudflare Pages with @cloudflare/next-on-pages

## ✅ Configuration Complete

Your app is now configured for Cloudflare Pages with full Next.js functionality including API routes.

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Configure for Cloudflare Pages with @cloudflare/next-on-pages"
git push origin main
```

### 2. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| Framework preset | **Next.js** |
| Build command | `npm run pages:build` |
| Build output directory | `.vercel/output/static` |
| Root directory | `/` |

### 3. Environment Variables

In your Cloudflare Pages project settings, add:

```
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

### 4. Deploy

- Save settings → Cloudflare Pages automatically builds and deploys
- Your app will be live at `https://optipix.pages.dev`

## 📋 What Works

✅ **Full Next.js Features**:
- Image compression (client-side)
- Image format conversion
- Image editing and cropping
- Background removal (API route)
- All UI components and themes
- Server-side rendering where needed

✅ **Cloudflare Optimizations**:
- Edge Runtime for API routes
- Global CDN distribution
- Automatic HTTPS
- Node.js compatibility for server features

## 🔧 Configuration Files

### `package.json`
- Added `@cloudflare/next-on-pages` dependency
- Added `pages:build` script
- Downgraded to Next.js 15 for compatibility

### `wrangler.json`
- Configured for Node.js compatibility
- Added environment variables
- Set up assets directory

### `app/api/remove-bg/route.ts`
- Added `export const runtime = 'edge'` for Cloudflare compatibility

## 🌍 Custom Domain (Optional)

1. In Pages project → **Custom domains**
2. Add your domain (e.g., `optipix.yourdomain.com`)
3. Update DNS records as instructed

## 🔄 Development Workflow

### Local Development
```bash
npm run dev  # Standard Next.js dev server
```

### Build for Cloudflare
```bash
npm run pages:build  # Builds for Cloudflare Pages
```

### Preview Deployments
- Push to feature branches → Automatic preview deployments
- Main branch → Production deployment

## 🚨 Important Notes

1. **API Routes**: Must use `export const runtime = 'edge'`
2. **Environment Variables**: Set in Cloudflare dashboard, not `.env`
3. **Node.js APIs**: Enabled via `nodejs_compat` flag in `wrangler.json`
4. **Build Output**: Always use `.vercel/output/static`

## 🐛 Troubleshooting

### Build Issues
- Ensure Next.js version ≤ 15.5.2
- Check all API routes have Edge Runtime
- Verify `wrangler.json` configuration

### API Route Issues
- Add `export const runtime = 'edge'` to all API routes
- Check environment variables in Cloudflare dashboard
- Ensure `nodejs_compat` flag is enabled

### Performance
- Static pages are cached globally
- API routes run on Edge network
- Images are optimized automatically

## 💰 Cost

- **Cloudflare Pages**: Free tier includes:
  - Unlimited bandwidth
  - 20,000 Edge Function requests/month
  - 500 builds/month
- **Remove.bg API**: Pay-per-use
- **Total**: Can be free within limits

## 🎯 Next Steps

1. Deploy to Cloudflare Pages
2. Test all features including background removal
3. Set up custom domain if needed
4. Monitor usage in Cloudflare dashboard

Your OptiPix app is now ready for production deployment on Cloudflare Pages! 🎉
