# Portfolio Website

A modern, responsive portfolio website built with Next.js 16, React 18, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Next.js 16 with App Router, React 18, TypeScript
- **Responsive Design**: Fully responsive across all devices
- **Performance Optimized**: Image optimization, code splitting, and lazy loading
- **SEO Ready**: Meta tags, sitemap, and robots.txt configured
- **Security**: Security headers and best practices implemented
- **Analytics**: Vercel Analytics integration
- **Animations**: Smooth animations with Framer Motion and GSAP

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher (or yarn/pnpm)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd folio-v1-main
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Update Site Metadata

Update the following files with your information:
- `app/layout.tsx` - Update metadata, title, description
- `public/robots.txt` - Update sitemap URL
- `app/sitemap.ts` - Update base URL

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔒 Security Features

- Security headers configured (XSS protection, content type options, frame options)
- HTTPS enforcement
- Environment variables for sensitive data
- No sensitive data in client-side code

## 📊 Performance

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Compression enabled
- Optimized fonts and assets

## 🐛 Error Handling

- Error boundaries for graceful error handling
- Custom 404 page
- Global error handler

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is private and proprietary.

## 👤 Author

Waqas Qureshi

## 🤝 Contributing

This is a personal portfolio project. Contributions are welcome but please open an issue first to discuss changes.

## 📞 Support

For support, please open an issue in the repository.

---

Built with ❤️ using Next.js
