# Create Setup For Nginx

This document describes how to set up cucumber-frontend with
nginx as an SSL proxy in front of the application.

## Requirements

You need:

- Nginx
- Perl
- openssl

## Create a Local Configuration

Run the script `setup.pl`.  It will complain about a missing configuration file `config.pm` and give you hints for creating a cucumber app with the correct URIs.

Create the app and fill in the `APP_ID` and `APP_SECRET` in the configuration file `config.pm` that had been automatically created.  If you already have an app and the hostname matches, you can, of course, use the existing app.

You can also override the hostname in `config.pm`.  By default the hostname is
determined automatically.

Now re-run `setup.pl`.  It will create all configuration files needed for cucumber-frontend and an nginx configuration file for two new virtual hosts.  Include the nginx configuration in the http context of your nginx and reload nginx ("sudo nginx -s reload" or whatever your vendor has prepared for reloading nginx).

## Start the Two Services

Make sure that you have copied the top-level `Gruntfile.js.default` to `Gruntfile`.  There should be no need to edit it.

Open a terminal window:

```
cd /path/to/cucumber-frontend
npm start
```

Do *not* set the environment variable `CT_URL`, it is not necessary.

Open another terminal and:

```
cd /path/to/cucumber-frontend
grunt serve
```

This will open your browser with a localhost URL.  Close the tab, and point your browser to `https://your.fully-qualified-domain.name:4444`.  If you have changed the `APP_PORT` in `config.pm` replace it accordingly.

Now log in and use the service.

## Changing Your Location

The setup will become invalid, when your hostname changes.  You can then rerun `setup.pl` which will add a setup for the new location but you will also need a new cucumber application then.

If you have multiple such setups, you can always switch between them by running `setup.pl` again.

## Import Root Certificate

The script has created a certificate authority for you that has signed the server certificate for you.  If you want to avoid being prompted by the browser because of an insecure certificate you can import the root certificate into your browser.

### Firefox

In Firefox go to Preferences => Advanced => Certificates => View Certificates => Authorities and click `Import...`.  Select the file `cucumber-frontend/nginx/ca/certs/ca.cert.pem`.  In the next dialog box check "This certificate can identify websites" and leave the rest unchecked.

If you later want to remove the certificate, it can be found under "Cucumber Tony Development Dummy Root CA".  You can simply remove it there or edit the trust to none.

### Chrome

Choose "Settings" from the menu, make sure "Settings" is selected in the left pane, scroll down, click on "Show advanced settings...", scroll down to "HTTP/SSL", and click "Manager Certificates".  This will bring you to the certificate management of your operating system where you can add the certificate with the appropriate trust settings.

## Expired Certificates

The root certificate has a validity of 60 days, the server certificates have a validity of 30 days.

If a server certificate expires, just delete it (`nginx/ca/certs/HOSTNAME.cert.pem`).  If the root certificate expires just delete the entire directory `nginx/ca` and rerun the script.

## Improved Security

All keys are created without a passphrase.  They are not meant for production use.  If you feel uncomfortable with that, just add a passphrase:

```
cd /path/to/cucumber-frontend/nginx
openssl rsa -aes256 -in ca/private/ca.key.pem -out ca/private/ca.key.pem.new
mv ca/private/ca.key.pem.new ca/private/ca.key.pem
```

Removing the key again works exactly the same, only you omit the "-aes256", and you will be prompted for the passphrase.
