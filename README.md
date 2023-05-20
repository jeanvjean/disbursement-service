### Author: Akomolafe Tosin

### How to use

1. Clone Repopository at git clone https://{username}@bitbucket.org/akudevs/backend-template.git
2. create .env
3. copy the value of .env.sample and fill it up in .env file
4. ``` npm install ```
5. ``` npm start ```

### Create a migration file

#### with sql

```
node_modules/db-migrate/bin/db-migrate create [table_name] --sql-file
```

#### without sql

```
node_modules/db-migrate/bin/db-migrate create [table_name]
```