# Suraga Elzibaer - Bilingual Learning Assistant Website

A professional bilingual (English/Arabic) portfolio website for a Learning Assistant specializing in inclusive education in Dubai.

## 🚀 Features

- **Bilingual Support**: Full English and Arabic (RTL) versions
- **Modern Design**: Glassmorphism, animations, and responsive layout
- **Accessibility**: Reduced motion support, semantic HTML, ARIA labels
- **SEO Optimized**: Meta tags, Open Graph, sitemap, robots.txt
- **Contact Form**: FormSubmit.co integration for email notifications
- **Portfolio Modal**: PDF document viewer for credentials
- **Mobile-First**: Fully responsive design

## 📁 Project Structure

```
suraga-website/
├── index.html          # English version
├── ar.html             # Arabic (RTL) version
├── css/
│   ├── style.css       # Main styles
│   ├── arabic.css      # RTL-specific styles
│   └── responsive.css  # Media queries
├── js/
│   └── main.js         # Core JavaScript
├── assets/
│   ├── images/         # Profile and hero images
│   │   └── suraga-headshot.jpg
│   └── docs/           # PDF documents
│       ├── experience-letter-taaleem.pdf
│       ├── recommendation-unity.pdf
│       └── secondary-certificate.pdf
├── data/
│   └── content.json    # Bilingual content
├── robots.txt          # SEO crawling rules
├── sitemap.xml         # SEO sitemap
└── README.md           # This file
```

## 🛠️ Quick Start

### Local Development

1. **Clone or download** the project
2. **Open with VS Code** (recommended)
3. **Install Live Server extension** (ritwickdey.LiveServer)
4. **Right-click `index.html`** → "Open with Live Server"

Or use any local server:

```bash
# Python
python -m http.server 3000

# Node.js (install live-server globally)
npm install -g live-server
live-server --port=3000

# PHP
php -S localhost:3000
```

### Adding Your Content

1. **Profile Photo**: Replace `assets/images/suraga-headshot.jpg` with your photo (recommended: 400x400px, square)
2. **Documents**: Add your PDF certificates to `assets/docs/`
3. **Contact Info**: Update phone, email, and LinkedIn in both HTML files
4. **FormSubmit**: The contact form uses FormSubmit.co - update the email address in `js/main.js`

## 🌐 Deployment

### Netlify (Recommended)

1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. "Add new site" → "Import from Git"
4. Connect GitHub and select repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
6. Click "Deploy"

### GitHub Pages

1. Create repository named `username.github.io` or `suraga-website`
2. Push all files to `main` branch
3. Go to Settings → Pages
4. Source: Deploy from a branch → `main` → `/ (root)`
5. Save and wait for deployment

### Custom Domain

1. Purchase domain (e.g., suragaelzibaer.com)
2. In Netlify/GitHub Pages: Add custom domain
3. Update DNS:
   - A Record: `@` → Netlify/GitHub IP
   - CNAME: `www` → `your-site.netlify.app`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance Tips

1. **Compress images** with [TinyPNG](https://tinypng.com)
2. **Add lazy loading** to images: `loading="lazy"`
3. **Minify CSS/JS** for production
4. **Enable Gzip** (automatic on Netlify/Vercel)

## 📄 License

This project is free for personal use. Attribution appreciated but not required.

---

**Created for Suraga Elzibaer** | Dubai, UAE | 2025
