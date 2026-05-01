# CareLune

CareLune is a static beauty product blog with a public website and a Netlify/Decap admin panel.

## Public Website

Open `index.html` to view the public site.

## Online Admin

After publishing with Netlify, open:

```text
https://your-site-name.netlify.app/admin
```

The admin edits `data/products.json` in your GitHub repository, then Netlify rebuilds the public site.

## Setup

1. Create a GitHub repository and upload this folder.
2. In Netlify, create a new site from that GitHub repository.
3. Keep the publish directory as the repo root.
4. Enable Netlify Identity.
5. Enable Git Gateway.
6. Invite yourself as a user.
7. Open `/admin` on the live site and log in.

## Local Fallback

`admin.html` is a local-only editor that can export a `products.js` file. The preferred online workflow is `/admin`.
