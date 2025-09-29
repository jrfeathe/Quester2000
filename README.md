---

# Quester2000

Manage your to-do list better by tracking points to be redeemed for customizable rewards, promoting self rewarding while managing a healthy work-life balance.
A modern web application built with **React + TypeScript + Vite**, using a **PostgreSQL** database powered by **Prisma ORM**.

---

## 🚀 Tech Stack

* **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **Backend**: [Node.js](https://nodejs.org/) (npm)
* **Database**: [PostgreSQL](https://www.postgresql.org/)
* **ORM**: [Prisma](https://www.prisma.io/)
* **Linting & Formatting**: ESLint, TypeScript ESLint, Prettier
* **Optional Tools**:

  * [dBeaver](https://dbeaver.io/) – GUI database management
  * [Prisma Studio](https://www.prisma.io/studio) – Visual data editor

---

## 🛠️ Installation (Debian-based Linux)

### 1. System Setup

```bash
sudo apt update
sudo apt upgrade
sudo reboot

# Install essentials
sudo apt install build-essential curl git postgresql
sudo systemctl enable --now postgresql
```

### 2. Clone the Repository

```bash
git clone https://github.com/jrfeathe/Quester2000
cd Quester2000
```

### 3. Install Node.js & npm (via nvm)

```bash
# Install nvm
# ( Follow updated instructions: https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script )
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

# Verify
node -v
npm -v
```

### 4. Install Dependencies

```bash
npm install
npm install --save-dev prisma
npm install @prisma/client
```

### 5. Run Development Server

```bash
npm run dev
```

Stop with `Ctrl+C`.

### 6. Configure PostgreSQL

Open Postgres shell:

```bash
sudo -u postgres psql
```

Inside psql:

```sql
-- Create dedicated user
CREATE ROLE quester2000_u WITH LOGIN PASSWORD 'strongpassword';
-- Allow DB creation (for Prisma shadow DB)
ALTER ROLE quester2000_u CREATEDB;
-- Create app database
CREATE DATABASE quester2000_db OWNER quester2000_u;
exit
```

Inside the `.env` file update:

```bash
DATABASE_URL="postgresql://quester2000_u:strongpassword@localhost:5432/quester2000_db?schema=public"
```

### 7. Initialize Prisma

```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

### 8. Run Development Server

```bash
npm run dev
```

Stop with `Ctrl+C`.

---

## 📊 Optional Tools

* **dBeaver**: GUI for database connections → [Download here](https://dbeaver.io/download/)

> Select [ + New database connection ]

> PostgreSQL

> Connect by: Host

  * Host: `localhost`
  * Database: `quester2000_db`
  * Username: `quester2000_u`
  * Password: `strongpassword`
    
> Download driver files

* **Prisma Studio**:

```bash
npx prisma studio
```

---

## 📌 Notes on ESLint & TypeScript

This project comes with a recommended ESLint setup. For stricter type checking and React-specific rules, extend your `eslint.config.js` with:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---
