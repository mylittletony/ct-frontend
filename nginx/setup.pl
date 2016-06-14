#! /usr/bin/env perl

use strict;

use Cwd qw(abs_path);
use File::Spec;

use vars qw($APP_ID $APP_SECRET $OPENSSL);

sub slurp_file($);
sub load_config();
sub create_directories();
sub create_ca();
sub create_openssl_conf();

my ($volume, $directories, undef) = File::Spec->splitpath(abs_path $0);
my $here = File::Spec->catpath($volume, $directories);
$here =~ y{\\}{/};
$here =~ s{/$}{};

load_config;
create_directories;
create_ca;

sub create_ca() {
    my $ca_dir = "$here/ca";
    my $exists = -e "$ca_dir/ready";

    if ($exists) {
        print <<EOF;
$ca_dir/ready exists.
Will not create a certificate authority.
EOF

        return 1;
    }

    create_openssl_conf;
}

sub create_directories() {
    my @directories = (
        "$here/logs",
        "$here/ca",
        "$here/ca/certs",
        "$here/ca/crl",
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
EOF
        }
        die <<EOF;
Local configuration not found.
Created $here/config.pm.
Please fill in the missing configuration values!
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
