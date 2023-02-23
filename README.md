# Nodejs Typescript Startup Template

Nodejs TypeScript REST API with login and authenticaton ( Express, Mongoose, Mongodb, jwt , passport )

# Pre-reqs

To build and run this app locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Install [VS Code](https://code.visualstudio.com/)

# Getting started

- Clone the repository

```
git clone --depth=1 https://github.com/joeljosephchalakudy/nodejs-typescript-rest-api
```

- Install dependencies

```
cd <project_name>
npm install
```

- Configure your mongoDB server

```bash
# create the db directory
sudo mkdir -p /data/db
# give the db correct read/write permissions
sudo chmod 777 /data/db
```

- Start your mongoDB server (you'll probably want another command prompt)

```
mongod
```

- Run the project

```
npm run dev
```

> **Note!** Make sure you have already have installed nodemon as global dependency or dev dependency `npm install -g nodemon` othewise you may encounter following error:- nodemon is not recognized as internal or external command, operable program or batch file

Finally, navigate to `http://localhost:1337` and you should see the template being served and rendered locally!

# Deploying the app

There are many ways to deploy an Node app, and in general, nothing about the deployment process changes here
