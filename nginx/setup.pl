#! /usr/bin/env perl

use strict;

use Cwd qw(abs_path);
use File::Spec;
use Net::Domain qw(hostfqdn);
use IO::Socket::INET;

use vars qw($APP_ID $APP_SECRET $OPENSSL $AUTH_PORT $APP_PORT $HOSTNAME);

sub slurp_file($);
sub load_config();
sub create_directories();
sub create_ca();
sub create_openssl_conf();
sub openssl;
sub create_server_cert($);
sub get_ip();
sub create_nginx_conf($);
sub create_local_env($);
sub create_local_constants;
sub get_hostname;

my ($volume, $directories, undef) = File::Spec->splitpath(abs_path $0);
my $here = File::Spec->catpath($volume, $directories);
$here =~ y{\\}{/};
$here =~ s{/$}{};

load_config;
my $fqdn = $HOSTNAME;
$fqdn = get_hostname unless defined $fqdn && length $fqdn;
create_directories;
create_ca;
create_server_cert $fqdn;
create_local_env $fqdn;
create_local_constants;
create_nginx_conf $fqdn;

sub create_local_constants {
    my $filename = abs_path "$here/../server/config/local.constants.js";
    open(my $fh, '>', $filename)
        or die "cannot create '$filename': $!\n";

    print $fh <<EOF;
'use strict';

module.exports = {
    API_END_POINT: 'https://api.ctapp.io/api/v1',
    AUTH_URL: 'https://api.ctapp.io',
    AUTH_URL: 'https://id.ctapp.io',
    STRIPE_KEY: '',
    SLACK_TOKEN: '',
    CHIMP_TOKEN: '',
    INTERCOM: '',
    PUSHER: ''
};
EOF

    print "# Wrote '$filename'.\n";

    return 1;
}

sub create_local_env($) {
    my ($fqdn) = @_;

    my $filename = abs_path "$here/../server/config/local.env.sample.js";
    open(my $fh, '>', $filename)
        or die "cannot create '$filename': $!\n";

    print $fh <<EOF;
'use strict';

module.exports = {
    callbackURL: "https://$fqdn:$AUTH_PORT/auth/login/callback",
    authorizationURL: "http://id.ctapp.io/oauth/authorize",
    profileURL: "http://api.ctapp.io/api/v1/me.json",
    tokenURL: "http://id.ctapp.io/oauth/token",
    APP_ID: "$APP_ID",
    APP_SECRET: "$APP_SECRET",
    baseURL: "https://$fqdn:$APP_PORT/#/",
    DEBUG: 'true'
};
EOF

    print "# Wrote '$filename'.\n";

    return 1;
}

sub create_nginx_conf($) {
    my ($fqdn) = @_;

    my $filename = "$here/nginx.conf";
    open(my $fh, '>', $filename)
        or die "cannot create '$filename': $!\n";

    print $fh <<EOF;
server {
    listen $AUTH_PORT ssl;

    server_name $fqdn;

    access_log $here/logs/auth-server-access.log;
    error_log $here/logs/auth-server-error.log;

    ssl on;
    ssl_certificate $here/ca/certs/$fqdn.cert.pem;
    ssl_certificate_key $here/ca/private/$fqdn.key.pem;

    location / {
        proxy_pass http://127.0.0.1:9000;
        include $here/conf/proxy.inc;
    }
}

server {
    listen $APP_PORT ssl;

    server_name $fqdn;

    access_log $here/logs/app-server-access.log;
    error_log $here/logs/app-server-error.log;

    ssl on;
    ssl_certificate $here/ca/certs/$fqdn.cert.pem;
    ssl_certificate_key $here/ca/private/$fqdn.key.pem;

    location / {
        proxy_pass http://127.0.0.1:9090;
        include $here/conf/proxy.inc;
    }
}
EOF

    print <<EOF;
# nginx conf written: $filename
# Add this line to the http context of your nginx configuration:
#
#    include $here/nginx.conf;
#
# Then reload nginx ("sudo nginx -s reload"), and start the authentication
# server ("grunt serve") and the application server ("npm start").  If the
# browser does not open automatically point it here:
#
#    https://$fqdn:$APP_PORT/
#
# Optionally install the CA certificate in your browser (see README.md).
EOF
    return 1;
}

sub create_ca() {
    my $ca_dir = "$here/ca";
    my $exists = -e "$ca_dir/certs/ca.cert.pem";

    if ($exists) {
        print <<EOF;
# $ca_dir/certs/ca.cert.pem exists.
# Will not create a certificate authority.
EOF

        return 1;
    }

    create_openssl_conf;

    print "# Generating CA private key.\n";
    openssl 'genrsa', '-out', "$ca_dir/private/ca.key.pem", 2048;
    chmod 0600, "$ca_dir/private/ca.key.pem";

    print "# Create and sign CA certificate.\n";
    openssl 'req', '-config', "$ca_dir/openssl.conf", '-batch', 
            '-subj', '/CN=Cucumber Tony Development Dummy Root CA',
            '-key', "$ca_dir/private/ca.key.pem",
            '-new', '-x509', '-days', 60, '-sha256', '-extensions', 'v3_ca',
            '-out', "$ca_dir/certs/ca.cert.pem";

    return 1;
}

sub create_server_cert($) {
    my ($fqdn) = @_;

    die "ca is an invalid hostname" if 'ca' eq $fqdn;

    my $ca_dir = "$here/ca";
    my $exists = -e "$ca_dir/certs/$fqdn.cert.pem";

    if ($exists) {
        print <<EOF;
# $ca_dir/certs/$fqdn.cert.pem exists.
# Will not create a server certificate.
EOF

        return 1;
    }

    print "# Generating private key for $fqdn.\n";
    openssl 'genrsa', '-out', "$ca_dir/private/$fqdn.key.pem", 2048;
    chmod 0600, "$ca_dir/private/$fqdn.key.pem";

    # We can just as well create and sign the request in one go but
    # we go with two steps for illustration purposes.

    print "# Generate certificate signing request for $fqdn.\n";
    openssl 'req', '-batch', '-subj', "/CN=$fqdn",
            '-config', "$ca_dir/openssl.conf",
            '-key', "$ca_dir/private/$fqdn.key.pem",
            '-new', '-sha256', '-out', "$ca_dir/csr/$fqdn.csr.pem";

    print "# Sign the certificate for $fqdn.\n";
    openssl 'ca', '-batch', 
            '-config', "$ca_dir/openssl.conf", '-extensions', 'server_cert',
            '-days', 30, '-notext', '-md', 'sha256',
            '-in', "$ca_dir/csr/$fqdn.csr.pem",
            '-out', "$ca_dir/certs/$fqdn.cert.pem";

    return 1;
}

sub create_directories() {
    my @directories = (
        "$here/logs",
        "$here/ca",
        "$here/ca/certs",
        "$here/ca/crl",
        "$here/ca/csr",
        "$here/ca/newcerts",
        "$here/ca/private",
    );

    foreach my $directory (@directories) {
        if (-e $directory) {
            die "error: $directory is in the way!\n"
                if !-d $directory;
        } else {
            mkdir $directory or die "cannot mkdir '$directory': $!\n";
        }
    }

    chmod 0700, "$here/ca/private";

    my $fh;
    my $filename = "$here/ca/serial";
    open(my $fh, '>', $filename)
        or die "cannot create '$filename': $!\n";
    print $fh '1000' or die;

    $filename = "$here/ca/index.txt";
    open ($fh, '>', $filename)
        or die "cannot create '$filename': $!\n";

    return 1;
}

sub load_config() {
    eval {
        unshift @INC, $here;
        require "$here/config.pm";
    };
    if ($@) {
        unless (-e "$here/config.pm") {
            open HANDLE, ">$here/config.pm"
                or die "cannot create '$here/config.pm': $!\n";
            print HANDLE <<'EOF';
# Create an app in cucumber and fill in the app id and the app secret.
$APP_ID = "";
$APP_SECRET = "";

# OpenSSL command.  If "openssl" is not in your $PATH set it here.
$OPENSSL = "openssl";

# Port numbers of the authentication server and app server.
$AUTH_PORT = 4443;
$APP_PORT = 4444;

# Fully-qualified domain name of your server.  Leave empty for your current
# hostname.
$HOSTNAME = "";
EOF
        }
        die <<EOF;
Local configuration not found.
Created $here/config.pm.
Create a Cucumber app with the following values:

    Callback URL: https://$fqdn:4443/auth/login/callback
    Application Website: https://$fqdn:4444

Then fill in the APP_ID and APP_SECRET in config.pm.
EOF
    }

    my $errors;

    unless (defined $APP_ID && length $APP_ID) {
        warn "$here/config.pm: error: APP_ID not configured.\n";
        ++$errors;
    }

    unless (defined $APP_SECRET && length $APP_SECRET) {
        warn "$here/config.pm: error: APP_SECRET not configured.\n";
        ++$errors;
    }

    unless (defined $OPENSSL && length $OPENSSL) {
        warn "$here/config.pm: error: OPENSSL not configured.\n";
        ++$errors;
    }

    unless (defined $AUTH_PORT && length $AUTH_PORT
            && $AUTH_PORT =~ /^[1-9][0-9]*$/
            && $AUTH_PORT > 0 && $AUTH_PORT <= 65536) {
        warn "$here/config.pm: error: AUTH_PORT not configured (1-65536).\n";
        ++$errors;
    }

    unless (defined $APP_PORT && length $APP_PORT
            && $APP_PORT =~ /^[1-9][0-9]*$/
            && $APP_PORT > 0 && $APP_PORT <= 65536 && $APP_PORT != $AUTH_PORT) {
        warn "$here/config.pm: error: APP_PORT not configured (1-65536).\n";
        ++$errors;
    }

    exit 1 if $errors;

    return 1;
}

sub slurp_file($) {
    my ($filename) = @_;

    local $/;
    local *HANDLE;

    open HANDLE, "<$filename" or die "$filename: $!\n";
    return <HANDLE>;
}

sub openssl {
    my (@args) = @_;

    my @quoted_args;
    foreach my $arg ($OPENSSL, @args) {
        if ($arg =~ /[ \t\r\n\\"]/) {
            my $quoted_arg = $arg;
            $quoted_arg =~ s/([\\"])/\\$1/g;
            push @quoted_args, qq("$quoted_arg");
        } else {
            push @quoted_args, $arg;
        }
    }
    $quoted_args[-1] .= "\n" if @quoted_args;

    print '$ ', join ' ', @quoted_args;

    if (0 != system $OPENSSL, @args) {
        if ($? == -1) {
            die "$OPENSSL: $!\n";
        } elsif ($? & 0x7f) {
            my $signo = $? & 0x7f;
            die "$OPENSSL: killed by signal number $signo.\n";
        } else {
            my $code = $? >> 8;
            die "$OPENSSL: terminated with exit code $code.\n";
        }
    }

    return 1;
}

sub get_hostname() {
    my $fqdn = hostfqdn;
    if (!defined $fqdn) {
        warn "Cannot determine fully qualified domain name.  Fall back to IP.\n";
        $fqdn = get_ip;
        if (!defined $fqdn) {
            $fqdn = 'localhost';
            warn "Cannot determine your IP address.  Fall back to localhost.\n";
        }
    }

    return lc $fqdn;
}

sub get_ip() {
    my $socket = IO::Socket::INET->new(
        Proto       => 'udp',
        PeerAddr    => '8.8.8.8',
        PeerPort    => '53', # DNS
    ) or return;

    my $local_ip = $socket->sockhost or return;

    return $local_ip;
}

sub create_openssl_conf() {
    my $filename = $here . '/ca/openssl.conf';

    open(my $fh, '>', $filename)
        or die "cannot create '$filename': $!\n";

    print $fh <<EOF;
# OpenSSL CA configuration file.
# See https://jamielinux.com/docs/openssl-certificate-authority/

[ ca ]
# `man ca`
default_ca = CA_default

[ CA_default ]
# Directory and file locations.
dir               = $here/ca
certs             = \$dir/certs
crl_dir           = \$dir/crl
new_certs_dir     = \$dir/newcerts
database          = \$dir/index.txt
serial            = \$dir/serial
RANDFILE          = \$dir/private/.rand

# The root key and root certificate.
private_key       = \$dir/private/ca.key.pem
certificate       = \$dir/certs/ca.cert.pem

# For certificate revocation lists.
crlnumber         = \$dir/crlnumber
crl               = \$dir/crl/ca.crl.pem
crl_extensions    = crl_ext
default_crl_days  = 30

# SHA-1 is deprecated, so use SHA-2 instead.
default_md        = sha256

name_opt          = ca_default
cert_opt          = ca_default
default_days      = 375
preserve          = no
policy            = policy_loose

[ policy_loose ]
# See the POLICY FORMAT section of the `ca` man page.
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
# Options for the `req` tool (`man req`).
default_bits        = 2048
distinguished_name  = req_distinguished_name
string_mask         = utf8only

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha256

# Extension to add when the -x509 option is used.
x509_extensions     = v3_ca

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
countryName                     = Country Name (2 letter code)
stateOrProvinceName             = State or Province Name
localityName                    = Locality Name
0.organizationName              = Organization Name
organizationalUnitName          = Organizational Unit Name
commonName                      = Common Name
emailAddress                    = Email Address

[ v3_ca ]
# Extensions for a typical intermediate CA (`man x509v3_config`).
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ server_cert ]
# Extensions for server certificates (`man x509v3_config`).
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ crl_ext ]
# Extension for CRLs (`man x509v3_config`).
authorityKeyIdentifier=keyid:always

[ ocsp ]
# Extension for OCSP signing certificates (`man ocsp`).
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, OCSPSigning
EOF

    return 1;
}

