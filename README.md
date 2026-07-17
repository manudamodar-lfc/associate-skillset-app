# Associate Skillset Intake — Azure deployment

A two-part app:
- `frontend/` — the React form + admin dashboard (Vite)
- `api/` — Azure Functions backend (Node.js) that stores submissions in Azure Table Storage and protects the admin view with a password check that happens on the server, not in the browser

This is built to deploy as a single **Azure Static Web App**, which hosts the frontend and the API together under one URL and one free SSL certificate — including on a custom domain.

---

## 1. Prerequisites

- An Azure account (free tier is enough to start): https://azure.microsoft.com/free/
- [Node.js 18+](https://nodejs.org/) installed locally
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed (`az`)
- A GitHub account (Static Web Apps deploys from a git repo via GitHub Actions — this is the easiest path)

---

## 2. Push this project to GitHub

```bash
cd skillset-app
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub (e.g. `associate-skillset-app`), then:

```bash
git remote add origin https://github.com/<your-org>/associate-skillset-app.git
git branch -M main
git push -u origin main
```

---

## 3. Create the Azure Static Web App

```bash
az login

az group create --name skillset-app-rg --location eastus2

az staticwebapp create \
  --name associate-skillset-app \
  --resource-group skillset-app-rg \
  --source https://github.com/<your-org>/associate-skillset-app \
  --location eastus2 \
  --branch main \
  --app-location "frontend" \
  --api-location "api" \
  --output-location "dist" \
  --login-with-github
```

This does three things automatically:
- Wires up a GitHub Actions workflow that builds and deploys on every push to `main`
- Gives you a free URL like `https://<random-name>.azurestaticapps.net`
- Deploys the `api/` folder as managed Azure Functions, callable at `/api/*`

The first deploy kicks off as soon as this command finishes — check progress under the **Actions** tab of your GitHub repo.

---

## 4. Set the admin password (server-side secret)

Don't put the password in the code. Set it as an application setting instead:

```bash
az staticwebapp appsettings set \
  --name associate-skillset-app \
  --setting-names ADMIN_PASSWORD="choose-a-strong-password-here"
```

---

## 5. Create the storage table

```bash
az storage account create \
  --name skillsetappstorage \
  --resource-group skillset-app-rg \
  --location eastus2 \
  --sku Standard_LRS

az storage table create \
  --account-name skillsetappstorage \
  --name submissions
```

Grab the connection string and add it as another app setting:

```bash
CONN=$(az storage account show-connection-string \
  --name skillsetappstorage \
  --resource-group skillset-app-rg \
  --query connectionString -o tsv)

az staticwebapp appsettings set \
  --name associate-skillset-app \
  --setting-names TABLE_CONNECTION_STRING="$CONN"
```

---

## 6. Buy and connect a custom domain

If you don't have a domain yet, buy one from any registrar — Namecheap, GoDaddy, Cloudflare, or Azure's own domain service all work. A `.com` typically runs $10–15/year.

Once you have one (say `skills.yourcompany.com`):

1. In the Azure Portal, open your Static Web App → **Custom domains** → **Add**.
2. Enter `skills.yourcompany.com` and choose **CNAME**.
3. Azure gives you a CNAME record to add. In your domain registrar's DNS settings, add:
   - Type: `CNAME`
   - Host: `skills` (just the subdomain part)
   - Value: the `xxxx.azurestaticapps.net` value Azure gives you
4. Wait for DNS to propagate (often minutes, sometimes a few hours), then click **Validate** in the Azure Portal.

Azure automatically issues and renews a free SSL certificate for the domain — no extra steps.

If you want the bare root domain (`yourcompany.com` with no subdomain) instead of a subdomain, use an **ALIAS/ANAME** record if your registrar supports it, or an `A` record pointed at the IP Azure shows you.

---

## 7. Local development (optional, before you deploy)

```bash
npm install -g @azure/static-web-apps-cli
cd frontend && npm install && npm run build && cd ..
cd api && npm install && cd ..
swa start frontend/dist --api-location api
```

This runs the whole app (frontend + API) locally at `http://localhost:4280`, proxying `/api/*` to the Functions runtime just like production.

---

## What each part does

- `frontend/` — the same form and admin dashboard you saw as a Claude artifact, adapted to call `/api/submissions` instead of the artifact's built-in storage.
- `api/submissions/` — one Function handling both:
  - `POST /api/submissions` — public, saves a new associate's response
  - `GET /api/submissions` — requires the `x-admin-password` header to match `ADMIN_PASSWORD`; returns all responses
- `api/admin-login/` — a tiny endpoint the admin page calls to check the password before switching to the dashboard view, without exposing the real password to anyone inspecting the page.

The Excel export still happens entirely in the browser (via SheetJS), so no server changes were needed there.
