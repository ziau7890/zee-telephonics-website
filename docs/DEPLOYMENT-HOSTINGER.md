# Deploying on Hostinger (Phase 3)

**Do not start this until you decide to buy hosting.** Nothing here has been done yet. These steps are written for Hostinger's hPanel **File Manager**, so you do not need any special software. Take them one at a time.

Any Hostinger **Web Hosting** plan (Single, Premium or Business) or **Cloud** plan can run this site. The **Website Builder** plan cannot, because it does not accept custom code or PHP. If your plan has no email accounts included, the form still saves enquiries to the database; email alerts need a mailbox.

You need the ZIP file `zee-telephonics-website.zip`. Unzip it on your computer first. Inside you will find:

```
upload/public_html/       everything that goes INSIDE public_html
upload/zee-private/       config.example.php, goes NEXT TO public_html
database/schema.sql       the database tables
README.md, DEPLOYMENT-HOSTINGER.md
source/                   the full source code (not uploaded)
```

---

## Step 1. Connect the domain to the hosting plan

When you buy hosting, hPanel asks which domain to use. Choose **zeetelephonicsbpo.com** (it is already in your Hostinger account). Because the domain already uses Hostinger's nameservers, no DNS change should be needed. Wait until hPanel shows the website as active.

## Step 2. Turn on the free SSL certificate

hPanel > **Websites** > zeetelephonicsbpo.com > **Security** > **SSL**. Install the free SSL and wait until it shows **Active**. Do this before uploading, because the site redirects every visit to `https://`.

## Step 3. Create the database

1. hPanel > **Databases** > **MySQL Databases**.
2. Create a database (for example `zee_leads`) and a user (for example `zee_user`) with a strong password. Hostinger adds a prefix like `u123456789_`. **Write down the full database name, user name and password.**
3. Click **Enter phpMyAdmin** next to the new database.
4. In phpMyAdmin, click **Import**, choose `database/schema.sql` from the unzipped folder, and click **Import** (or **Go**). You should now see two tables: `leads` and `lead_attempts`.

## Step 4. Create the mailbox for alerts (if your plan includes email)

1. hPanel > **Emails** > create `info@zeetelephonicsbpo.com` (or another address you prefer) with a strong password.
2. Write down the address and password. The SMTP server is `smtp.hostinger.com`, port `465`, encryption SSL.

## Step 5. Upload the website files

1. hPanel > **Files** > **File Manager**. Open the folder for your domain. It is usually `domains/zeetelephonicsbpo.com/public_html` (on some plans just `public_html`).
2. If `public_html` contains a default `default.php` or `index.php` from Hostinger, delete it.
3. Upload **the contents** of `upload/public_html/` into `public_html`. The easiest way: zip the *contents* of that folder on your computer, upload that zip into `public_html`, right-click it > **Extract**, then delete the zip.
4. Check that `public_html` now contains `index.html`, `.htaccess`, and the folders `_astro`, `api`, `services`, `contact` and so on. If you do not see `.htaccess`, turn on **Show hidden files** in File Manager settings.

## Step 6. Add the private configuration file

1. In File Manager, go **one level up** from `public_html` (to the folder that contains `public_html`).
2. Create a new folder named **`zee-private`**.
3. Upload `upload/zee-private/config.example.php` into it, then rename it to **`config.php`**.
4. Right-click `config.php` > **Edit** and fill in:
   * `database`: the database name, user and password from Step 3.
   * `mail`: the mailbox address and password from Step 4, and who should receive alerts (`notify_to`). If you have no mailbox yet, set `'enabled' => false`; enquiries will still be saved.
   * `security` > `ip_salt`: replace with a long random string (any 40+ random letters and numbers).
5. Save. This file is outside `public_html`, so nobody can download it from the web.

If your plan does not let you create folders above `public_html`, use the fallback: put `config.php` in `public_html/api/private/`. That folder is blocked from the web by its own `.htaccess` file.

## Step 7. Test everything online

1. Open `https://zeetelephonicsbpo.com` on a computer and on your phone. Check the menu and a few pages.
2. Go to **Contact**, send a real test enquiry with your own email address.
3. You should land on the **Thank you** page, receive an alert email in the `notify_to` inbox, and (if switched on) a confirmation at the address you typed.
4. In phpMyAdmin, open the `leads` table: your test enquiry should be there.
5. If the form says it could not send: check `config.php` values, then hPanel > **Advanced** > **PHP error logs** for lines starting with `[zee-lead]`.

If alert emails land in spam, check that hPanel > **Emails** shows SPF, DKIM and DMARC as set up for the domain.

## Step 8. After launch

* Submit `https://zeetelephonicsbpo.com/sitemap-index.xml` in Google Search Console.
* Turn on daily backups in hPanel if your plan includes them.
* Optional: add Cloudflare Turnstile (free) for stronger spam protection. Put the **site key** in `src/content/site.json` (`turnstileSiteKey`), rebuild and re-upload, and the **secret key** in `config.php` (`turnstile_secret`).

## Updating the website later

1. Edit the content files (see README), then run `npm run package` (or ask Claude to build a new ZIP).
2. Upload the new contents of `upload/public_html/` over the old files. Your `zee-private/config.php` and the database are not touched.
