#Animal Shelter Database Setup

## Requirements
- MySQL installed (preferably in WSL or Linux)
- Access to terminal
- Git cloned project

## Step 1: Start MySQL server

If you're using WSL UBUNTU:

```bash
sudo service mysql start
```

## Step 2: Load the Database Schema

This step will create the animal_shelter_db database and all necessary tables.

OPTION 1: If you know your MySQL root password
```bash
mysql -u root -p < db/schema.sql
```
OPTION 2: If you haven't set a password (use sudo)
``` bash
sudo mysql < db/schema.sql
```

## Step 3: Applying future Database changes

To avoid rewriting the entire schema each time, we version changes using individual SQL update files named using the format:

update_YYYY_MM_DD.sql

Each update file contains only the **new changes** , like:
- Creating new tables
- Adding columns
- Altering table structures
- etc..

### Location of Updates

You can find all update files inside the `server/db/` directory:
server/
|______db/
|______schema.sql
|______update_yyyy_mm_dd.sql
|______ ....

### When and How to Apply Updates
### For First Time Setup:

1. Run the base schema:
```bash
mysql -u root -p < db/schema.sql
```
2. Then apply all update files created after the schema was last updated, in order:
```bash
mysql -u root -p < db/update_yyyy_mm_dd.sql
mysql -u root -p < db/update_yyyy_mm_dd.sql
....
```
If you do not have your MySQL password set, use sudo:
```bash
sudo mysql < db/schema.sql
sudo mysql < db/update_yyyy_mm_dd.sql
```
### For The Ones Who Already Ran schema.sql previously:

Only apply the latest updates you haven't ran yet:
```bash
mysql -u root -p < db/update_yyyy_mm_dd.sql
.....
```
This will safely apply new changes to your existing database without affecting your data or existing tables.

## IMPORTANT NOTES:

Every update file must begin with the line:
```sql
USE animal_shelter_db;
```
So MySQL knows where to apply the changes.

- Do not skip update files - they are cumulative.
- Do not rerun schema.sql if you already have a working database with data (unless you want to wipe and reset everything).

## Running SQL Files On Different Systems

You can apply schema and update files using your system;s terminal. 

### LINUx/ WSL/ macOS

Open terminal and run:
```bash
mysql -u root -p < server/db/schema.sql
mysql -u root -p < server/db/update_yyyy_mm_dd.sql
```
If MySQL is installed via Homebrew on macOS, you may need to run:
```bash
brew services start mysql
```

Windows (non-WSL)
Use the MySQL Command Line Client or Git Bash:
```bash
mysql -u root -p < server/db/schema.sql
```
Or open the MySQL Shell or Workbench, then paste the SQL manually.

## NOTE all .sql files that include the line
## USE animal_shelter_db; will automatically target the correct database.