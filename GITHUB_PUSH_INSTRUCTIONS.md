# How to Push Your Project to GitHub

Here is a step-by-step guide to push your project to GitHub, ensuring only necessary files are included.

## Step 1: Create a Repository on GitHub
1.  Go to [GitHub](https://github.com/) and log in.
2.  Click the **+** icon in the top right -> **New repository**.
3.  Name it `jp2-converter`.
4.  Do **NOT** initialize with README, .gitignore, or License (we already have them).
5.  Click **Create repository**.

## Step 2: Push Your Code
Open your terminal (Command Prompt or PowerShell) in the project folder (`E:\Apps Developed\jp2_converter`) and run the following commands one by one:

### 1. Configure Your Identity (If not done before)
Replace the email and name with your GitHub email and name.
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

### 2. Initialize and Commit
```bash
git init
git add .
git commit -m "Initial commit"
```

### 3. Connect to GitHub
Replace `YOUR_USERNAME` with your actual GitHub username.
```bash
git remote add origin https://github.com/YOUR_USERNAME/jp2-converter.git
git branch -M main
git push -u origin main
```

That's it! Your code is now live on GitHub with only the necessary files (source code, configuration) while ignoring temporary files like `node_modules` and `venv`.
