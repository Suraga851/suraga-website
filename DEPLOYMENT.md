# Deployment Guide

This guide covers deploying the Suraga Elzibaer website to Vercel using the new JAMstack architecture.

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Node.js 18+ installed locally

## Quick Deployment

### Option 1: One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/suraga-website&project-name=suraga-website&org=your-username)

### Option 2: Manual Setup

1. **Fork/Clone the Repository**
   ```bash
   git clone https://github.com/your-username/suraga-website.git
   cd suraga-website
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial JAMstack deployment"
   git branch -M main
   git remote add origin https://github.com/your-username/suraga-website.git
   git push -u origin main
   ```

3. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - Framework Preset: `Other`
     - Build Command: `cd frontend && npm run build`
     - Output Directory: `frontend/dist`
     - Root Directory: `/`
   - Click "Deploy"

## Environment Variables

For the contact form to work properly, you'll need to set up email sending. The current implementation logs submissions but doesn't send emails. To add email functionality:

1. **Using FormSubmit.co (Free)**
   - Update the contact form to use FormSubmit.co endpoint
   - Set `formsubmit_email` environment variable in Vercel

2. **Using EmailJS (Free)**
   - Sign up at [emailjs.com](https://www.emailjs.com/)
   - Create email template
   - Set environment variables:
     - `EMAILJS_SERVICE_ID`
     - `EMAILJS_TEMPLATE_ID`
     - `EMAILJS_PUBLIC_KEY`

3. **Using SendGrid (Free tier)**
   - Sign up at [sendgrid.com](https://sendgrid.com/)
   - Create API key
   - Set environment variables:
     - `SENDGRID_API_KEY`
     - `SENDGRID_FROM_EMAIL`

## GitHub Actions Deployment

The repository includes a GitHub Actions workflow that automatically deploys to Vercel on every push to main/master.

To enable this:

1. **Get Vercel Tokens**
   - Go to [vercel.com/settings/tokens](https://vercel.com/settings/tokens)
   - Create a new token
   - Note your Org ID and Project ID from project settings

2. **Set GitHub Secrets**
   In your GitHub repository, go to Settings → Secrets and variables → Actions, then add:
   - `VERCEL_TOKEN`: Your Vercel deployment token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Performance Optimizations

The new JAMstack architecture includes several performance improvements:

- **Edge Caching**: Vercel's global CDN
- **Code Splitting**: Automatic chunking of vendor and Three.js libraries
- **Compression**: Gzip/Brotli compression enabled
- **Caching Headers**: Optimized cache headers for assets
- **Image Optimization**: Ready for Vercel Image Optimization

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring (free tier)
- **Error Tracking**: Console errors logged to Vercel
- **Build Logs**: View build logs in Vercel dashboard

## Custom Domain

To use a custom domain:

1. Add your domain in Vercel project settings
2. Update DNS settings with provided records
3. Enable SSL (automatic in Vercel)

## Troubleshooting

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### Contact Form Not Working
- Verify API route is deployed
- Check browser console for errors
- Test with simple form submission

### Performance Issues
- Check Vercel Analytics for slow pages
- Verify images are optimized
- Check for large bundle sizes

## Cost

This deployment uses only free tiers:
- Vercel: Free tier (100GB bandwidth, 100GB storage)
- GitHub Actions: Free for public repos
- No server costs (static hosting)

## Support

For issues with this deployment setup, please check:
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/guide/)