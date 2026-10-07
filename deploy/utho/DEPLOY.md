# Deploying Wasteman to the Utho box, alongside Clean Washroom

Target: the existing Utho server at **`150.241.244.225`** (Mumbai, Ubuntu 22.04,
2 vCPU · 4 GB · 80 GB) that already runs Clean Washroom.

Wasteman is installed **beside** Clean Washroom, not over it. Everything it owns
is new and separately named:

| | Clean Washroom (untouched) | Wasteman (new) |
|---|---|---|
| Code | `/var/www/cleanwashroom` | `/var/www/wasteman` |
| Database | `cleanwashroom` | `wasteman` |
| DB user | `cleanwashroom` | `wasteman` |
| PHP-FPM pool | `www` → `php8.3-fpm.sock` | `wasteman` → `php8.3-fpm-wasteman.sock` |
| Nginx site | `cleanwashroom-api`, `cleanwashroom-app` | `wasteman` |
| Hostnames | `cleanwashroom.org`, `api.…`, `app.…` | `wasteman.in`, `www.wasteman.in` |
| Queue worker | — | `wasteman-queue.service` |

**Genuinely shared, and therefore worth watching:** the 80 GB disk, 4 GB RAM,
2 vCPU, and the MySQL and Nginx server processes. See *Capacity* at the end.

> **Why the separate FPM pool.** The alternative is putting Wasteman on Clean
> Washroom's `www` pool, where a burst of report submissions — or one classifier
> call waiting on the Anthropic API — would occupy workers Clean Washroom needs,
> and Clean Washroom would start returning 502s for reasons invisible in its own
> logs. The pool also lets Wasteman set its own upload and memory limits without
> editing `99-cleanwashroom.ini`, which is global and applies to every pool.

---

## 0. Before anything — access and a baseline

### 0a. Authorise this machine's SSH key

The server answers on 22, but the key on this Windows machine is **not** in its
`authorized_keys` yet — a connection attempt returns
`Permission denied (publickey,password)`. Add it once, from a session where you
are already logged in:

```bash
ssh root@150.241.244.225 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

The public key to paste is in `deploy/utho/authorized_key.txt` next to this file.
It is a public key — safe to paste anywhere. Verify with:

```bash
ssh -o BatchMode=yes root@150.241.244.225 "echo CONNECTED"
```

### 0b. Record the baseline

Run this **before** changing anything, and keep the output. It is what you
compare against if Clean Washroom misbehaves later.

```bash
ssh root@150.241.244.225 'bash -s' <<'EOF'
echo "--- disk ---";      df -h /
echo "--- memory ---";    free -m
echo "--- php ---";       php -v | head -1; ls /etc/php/
echo "--- fpm pools ---"; ls /etc/php/8.3/fpm/pool.d/
echo "--- nginx ---";     nginx -v; ls /etc/nginx/sites-enabled/
echo "--- mysql ---";     mysql -e "SHOW DATABASES;"
echo "--- services ---";  systemctl is-active nginx php8.3-fpm mysql
EOF
```

Check three things in that output before continuing:

- **Disk** has room. Clean Washroom's media is on the same 80 GB.
- **PHP is 8.3.** If it is not, correct the socket path and pool directory in
  `php-fpm-wasteman.conf` and `nginx-wasteman.conf` to match.
- **No `wasteman` database already exists.**

### 0c. Back up what you are about to add to

```bash
ssh root@150.241.244.225 "tar czf /root/nginx-backup-\$(date +%F).tgz /etc/nginx/sites-available /etc/nginx/sites-enabled"
```

Cheap, and the thing you will want if a `certbot --nginx` run rewrites a config
you did not expect it to.

---

## 1. Register the DNS records

At your registrar's DNS panel, two **A** records pointing at the server:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `150.241.244.225` | 3600 |
| A | `www` | `150.241.244.225` | 3600 |

Do this **first** — propagation takes anywhere from minutes to a few hours, and
Let's Encrypt in step 7 cannot issue a certificate until the name resolves here.

Check from your machine:

```bash
nslookup wasteman.in
```

Do not continue to step 7 until that returns `150.241.244.225`.

---

## 2. Ship the code

The source lives at **`github.com/aswamofficial/wasteman`**, and it is
**private** — so the server needs its own credential. A read-only *deploy key*
is the right one: it grants access to this repository alone, which an account
token would not.

### 2a. Give the server a deploy key

On the server, generate a keypair that exists only for this purpose:

```bash
ssh-keygen -t ed25519 -C "wasteman-utho-deploy" -f /root/.ssh/wasteman_deploy -N ""
cat /root/.ssh/wasteman_deploy.pub
```

Paste that public key into GitHub at
**Settings → Deploy keys → Add deploy key** on the `wasteman` repository.
Title it `utho-150.241.244.225`. **Leave "Allow write access" unchecked** — the
server only ever reads, and a read-only key cannot be used to push anything
back if the box is ever compromised.

Then tell SSH to use it for GitHub:

```bash
cat >> /root/.ssh/config <<'EOF'

Host github-wasteman
    HostName github.com
    User git
    IdentityFile /root/.ssh/wasteman_deploy
    IdentitiesOnly yes
EOF
chmod 600 /root/.ssh/config

ssh -T git@github-wasteman    # expect: "Hi aswamofficial/wasteman! You've successfully authenticated"
```

> `IdentitiesOnly yes` matters: without it SSH offers every key it has, and
> GitHub answers with whichever one it matches first — which may be a different
> repository's, and the clone then fails with a confusing permission error.

### 2b. Clone

```bash
mkdir -p /var/www/wasteman
git clone git@github-wasteman:aswamofficial/wasteman.git /var/www/wasteman
```

> `.env` is not in the repository, deliberately. The local one points at XAMPP
> on port 3307 with `APP_DEBUG=true`; using it in production would expose stack
> traces to citizens and fail to reach the database. Step 4 writes a fresh one.

Seeded demo report photos are also not in the repository — `storage/app/public`
ships empty, which is what you want for a real deployment.

---

## 3. Database

```bash
mysql -e "CREATE DATABASE wasteman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER 'wasteman'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME_STRONG';"
mysql -e "GRANT ALL ON wasteman.* TO 'wasteman'@'127.0.0.1'; FLUSH PRIVILEGES;"
```

`GRANT ALL ON wasteman.*` — scoped to this schema. The Wasteman user cannot read
Clean Washroom's tables, which is the point of giving it its own account rather
than reusing root.

---

## 4. Backend

```bash
cd /var/www/wasteman/wastenotify-api
cp /var/www/wasteman/deploy/utho/backend.env.example .env
nano .env     # DB_PASSWORD, ANTHROPIC_API_KEY, MAIL_*
php artisan key:generate
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --force      # roles, admin user, ward boundaries
php artisan storage:link
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

> **`ANTHROPIC_API_KEY` is the one that changes behaviour silently.** Left blank,
> the app runs the deterministic offline classifier: every report still gets a
> waste type, volume, weight and compostability, but none of it comes from a
> model, and the queue badges it "unverified". Nothing errors.

---

## 5. PHP-FPM pool

```bash
cp /var/www/wasteman/deploy/utho/php-fpm-wasteman.conf /etc/php/8.3/fpm/pool.d/wasteman.conf
php-fpm8.3 -t                    # config test — must say "test is successful"
systemctl reload php8.3-fpm
ls -l /run/php/php8.3-fpm-wasteman.sock     # must now exist
```

If the socket is missing, stop here — nginx will return 502 for every Wasteman
request and the cause will be in `/var/log/php8.3-fpm.log`.

---

## 6. Front end and nginx

```bash
cd /var/www/wasteman/wastenotify-app
npm ci
VITE_API_URL="https://wasteman.in/api" \
VITE_STORAGE_URL="https://wasteman.in/storage" \
VITE_APP_URL="https://wasteman.in" \
VITE_GOOGLE_MAPS_API_KEY="CHANGE_ME" \
  npm run build

cp /var/www/wasteman/deploy/utho/nginx-wasteman.conf /etc/nginx/sites-available/wasteman
ln -s /etc/nginx/sites-available/wasteman /etc/nginx/sites-enabled/
nginx -t                         # must pass before reloading
systemctl reload nginx
```

`nginx -t` tests **every** enabled site. If it fails on a Clean Washroom file you
have not touched, that error was already there — read it before assuming this
deploy caused it.

> **The Maps key.** The local `.env` carries a key belonging to the Clean
> Washroom Google Cloud project. Shipping it means Wasteman's map loads bill
> that project and break the moment its referrer restrictions are tightened.
> Create a Wasteman key, restrict it to `https://wasteman.in/*`, and use it here.

At this point `http://wasteman.in` should serve the app over plain HTTP.

---

## 7. HTTPS

```bash
certbot --nginx -d wasteman.in -d www.wasteman.in
```

certbot is already installed for Clean Washroom. It edits only the server block
matching the `-d` names and leaves Clean Washroom's certificates alone; the
renewal timer picks up the new certificate automatically.

---

## 8. Scheduler

Overdue reports escalate through `reports:escalate`, registered in the Laravel
scheduler for 06:00 daily. Without a cron entry it never runs and nothing is
ever escalated.

Clean Washroom already has its own `schedule:run` line. **Add** a second one —
do not edit theirs:

```bash
crontab -e
```

```cron
# Clean Washroom — leave this line alone
* * * * * cd /var/www/cleanwashroom/cleantoilet-api && php artisan schedule:run >> /dev/null 2>&1

# Wasteman
* * * * * cd /var/www/wasteman/wastenotify-api && php artisan schedule:run >> /dev/null 2>&1
```

Verify by hand: `php artisan reports:escalate` prints how many it raised.

---

## 9. Queue worker

```bash
cp /var/www/wasteman/deploy/utho/wasteman-queue.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now wasteman-queue
systemctl status wasteman-queue --no-pager
```

---

## 10. Verify — Wasteman, then Clean Washroom

```bash
# Wasteman
curl -I https://wasteman.in                       # 200, text/html
curl -s https://wasteman.in/api/legal/privacy     # 200, JSON
curl -I https://wasteman.in/storage/              # 403 or 404, never 502

# Clean Washroom — confirm it is exactly as it was
curl -I https://cleanwashroom.org
curl -I https://api.cleanwashroom.org
systemctl is-active nginx php8.3-fpm mysql
free -m                                           # compare against 0b
```

Then in a browser: sign in, submit a report with a photo, and check the analysis
panel shows type, volume, weight, recyclable and compostable. If the engine badge
reads "sample analysis", `ANTHROPIC_API_KEY` is not set or not cached.

---

## Updating later

Now that the code comes from git, an update is two commands on the server:

```bash
cd /var/www/wasteman && git pull
bash /var/www/wasteman/deploy/utho/deploy.sh
systemctl restart wasteman-queue
```

`deploy.sh` reinstalls dependencies, runs migrations, rebuilds the front end,
rebuilds the caches and reloads PHP-FPM. Push to `main` from Windows first.

---

## Capacity — the honest part

Four GB of RAM now carries MySQL, Nginx, two PHP-FPM pools and a queue worker.
Wasteman's pool is `ondemand` with `pm.max_children = 6`, so it holds nothing
while idle, but under simultaneous load the two apps do compete. Watch `free -m`
after the first busy day; if memory runs tight, lower `pm.max_children` to 4
before touching anything of Clean Washroom's.

The 80 GB disk is shared and report photos are the thing that grows. At ~2 MB a
photo, 10,000 reports is ~20 GB on top of whatever Clean Washroom's media
already occupies. `df -h` belongs in whatever monitoring you have; when it
tightens, add Utho block storage and move `storage/app/public` onto it rather
than pruning either app.

## If Clean Washroom breaks

Everything added here is removable without touching a Clean Washroom file:

```bash
rm /etc/nginx/sites-enabled/wasteman
rm /etc/php/8.3/fpm/pool.d/wasteman.conf
systemctl reload nginx php8.3-fpm
systemctl disable --now wasteman-queue
```

Clean Washroom is then exactly as it was, with Wasteman's code and database
still on disk for a retry.
