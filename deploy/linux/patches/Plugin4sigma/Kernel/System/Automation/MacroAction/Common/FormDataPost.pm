# --
# Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file LICENSE-AGPL for license information (AGPL). If you
# did not receive this file, see https://www.gnu.org/licenses/agpl.txt.

package Plugin4sigma::Kernel::System::Automation::MacroAction::Common::FormDataPost;

use strict;
use warnings;
use utf8;

use HTTP::Headers;
use HTTP::Request::Common;
use IO::Socket::SSL qw( SSL_VERIFY_NONE );
use LWP::UserAgent;
use MIME::Base64;
use URI;

use Kernel::System::VariableCheck qw(:all);

use base qw(Kernel::System::Automation::MacroAction::Common);

our @ObjectDependencies = (
    'Automation',
    'Config',
    'Encode',
    'JSON',
    'Ticket',
    'TemplateGenerator',
    'WebUserAgent'
);

=head1 NAME

4sigmaPlugin::Kernel::System::Automation::MacroAction::Common::FormDataPost - A module to execute POST requests with form data

=head1 SYNOPSIS

All WebHook functions.

=head1 PUBLIC INTERFACE

=over 4

=cut

=item Describe()

Describe this macro action module.

=cut

sub Describe {
    my ( $Self, %Param ) = @_;

    $Self->Description(Kernel::Language::Translatable('Executes a POST request with the given form data.'));
    $Self->AddOption(
        Name           => 'URL',
        Label          => Kernel::Language::Translatable('URL'),
        Description    => Kernel::Language::Translatable('The URL to send the request to.'),
        Required       => 1,
    );
    $Self->AddOption(
        Name           => 'UseProxy',
        Label          => Kernel::Language::Translatable('Use Proxy'),
        Description    => Kernel::Language::Translatable('Specifies if a proxy should be used.'),
        Required       => 0,
    );
    $Self->AddOption(
        Name           => 'Proxy',
        Label          => Kernel::Language::Translatable('Proxy'),
        Description    => Kernel::Language::Translatable('The proxy that should be used if "Use Proxy" is active. If none is given, the common proxy setting from the system config (option "WebUserAgent::Proxy") will be used.'),
        Required       => 0,
    );
    $Self->AddOption(
        Name           => 'Headers',
        Label          => Kernel::Language::Translatable('Headers'),
        Description    => Kernel::Language::Translatable('Special request headers to use. Each line represents a request header and its value, i.e. "Content-Type: application/json"'),
        Required       => 0,
    );
    $Self->AddOption(
        Name           => 'FormData',
        Label          => Kernel::Language::Translatable('Form Data'),
        Description    => Kernel::Language::Translatable('Provide a hash with key/value pairs, or a JSON with corresponding data structure. Value can be a string, or a hash containing the keys "Content" with base64 encoded content data, "ContentType" and optional "Filename" to post file data.'),
        Required       => 1,
    );
    $Self->AddOption(
        Name           => 'Debug',
        Label          => Kernel::Language::Translatable('Debug'),
        Description    => Kernel::Language::Translatable('Output the request and response in the automation log.'),
        Required       => 0,
    );

    $Self->AddResult(
        Name        => 'Response',
        Description => Kernel::Language::Translatable('An object containing the "HTTPCode", the "Status", the charset decoded response "Content", the raw response "RawContent", the "Headers" as key-value pairs and the "Result", which is the actual object if the response contains a JSON object.'),
    );

    return;
}

=item Run()

Run this module. Returns 1 if everything is ok.

Example:
    my $Success = $Object->Run(
        TicketID => 123,
        Config   => {
            URL      => 'http://somefqdn/api/test',
            FormData => {
                file => {
                    FileName    => 'file',
                    ContentType => 'text/plain; charset ="utf-8"',
                    Content     => '...'
                }
            }
        },
        UserID   => 123
    );

=cut

sub Run {
    my ( $Self, %Param ) = @_;

    # check incoming parameters
    return if !$Self->_CheckParams(%Param);

    my %Config = %{$Param{Config}};

    my $URL = $Config{URL};
    # check if url contains schema
    if ( $URL !~ m/^\w+:\/\// ) {
        $URL = 'https://' . $URL; # add https as fallback schema
    }

    my $FormData;
    if ( IsHashRefWithData( $Config{FormData} ) ) {
        $FormData = $Config{FormData};
    }
    elsif ( IsStringWithData( $Config{FormData} ) ) {
        $FormData = $Kernel::OM->Get('JSON')->Decode(
            Data => $Config{FormData}
        );
    }

    if ( !IsHashRefWithData( $FormData ) ) {
        $Kernel::OM->Get('Automation')->LogError(
            Referrer => $Self,
            Message  => "Got no form data",
            UserID   => $Param{UserID}
        );
        return;
    }

    # do the request
    my $Response = $Self->_DoRequest(
        URL      => $URL,
        Headers  => $Config{Headers},
        FormData => $FormData,
        UseProxy => $Config{UseProxy},
        Proxy    => $Config{Proxy},
        Debug    => $Config{Debug},
        UserID   => $Param{UserID}
    );
    return if !$Response;

    my $DecodedContent = $Response->decoded_content;
    $Kernel::OM->Get('Encode')->EncodeOutput(\$DecodedContent);
    my $RawContent = $Response->content;
    $Kernel::OM->Get('Encode')->EncodeOutput(\$RawContent);

    # prepare the results
    my %Result = (
        HTTPCode   => $Response->code,
        Content    => $DecodedContent,
        RawContent => $RawContent,
        Headers    => { map { $_ => $Response->headers->header($_) } $Response->headers->header_field_names },
        Status     => $Response->status_line,
    );

    # prepare the result
    if ( $Response->header('Content-Type') =~ /^application\/(json|javascript);?/ ) {
        # decode JSON
        $Result{Result} = $Kernel::OM->Get('JSON')->Decode(
            Data => $DecodedContent
        );
    }

    $Self->SetResult(Name => 'Response', Value => \%Result);

    return 1;
}

sub _DoRequest {
    my ( $Self, %Param ) = @_;

    my $UserAgent = LWP::UserAgent->new();

    # set user agent
    $UserAgent->agent(
        $Kernel::OM->Get('Config')->Get('Product') . ' ' . $Kernel::OM->Get('Config')->Get('Version')
    );

    # set timeout
    $UserAgent->timeout( $Kernel::OM->Get('WebUserAgent')->{Timeout} );

    # disable SSL host verification
    if ( $Kernel::OM->Get('Config')->Get('WebUserAgent::DisableSSLVerification') ) {
        $UserAgent->ssl_opts(
            verify_hostname => 0,
            SSL_verify_mode => SSL_VERIFY_NONE,
        );
    }

    # set proxy
    if ( $Param{UseProxy} ) {
        $UserAgent->proxy( [ 'http', 'https', 'ftp' ], $Param{Proxy} || $Kernel::OM->Get('WebUserAgent')->{Proxy} );

        if ( $Param{Debug} ) {
            $Kernel::OM->Get('Automation')->LogDebug(
                Referrer => $Self,
                Message  => "via proxy (http, https, ftp): ".($Param{Proxy} || $Kernel::OM->Get('WebUserAgent')->{Proxy}),
                UserID   => $Param{UserID}
            );
        }
    }
    else {
        delete $ENV{https_proxy};
        delete $ENV{http_proxy};
        delete $ENV{HTTPS_PROXY};
        delete $ENV{HTTP_PROXY};
        my $URI = URI->new( $Param{URL} );
        $UserAgent->no_proxy($URI->host);
    }

    # prepare request header
    my $Headers = HTTP::Headers->new();
    if ( $Param{Headers} ) {
        foreach my $Line ( split(/\n/, $Param{Headers} || '') ) {
            my ($Header, $Value) = split(/:\s*/, $Line);
            if ( !$Header || !$Value ) {
                $Kernel::OM->Get('Automation')->LogError(
                    Referrer => $Self,
                    Message  => "Error in headers definition - invalid header (line: \"$Line\").",
                    UserID   => $Param{UserID}
                );
                return;
            }
            $Headers->header($Header => $Value);
        }
    }

    # set content-type to form-data
    $Headers->header('Content-Type' => 'multipart/form-data');

    my $Content = $Self->_PrepareContent(
        FormData => $Param{FormData}
    );

    my $Request = HTTP::Request::Common::POST(
        $Param{URL},
        $Headers->flatten(),
        Content => $Content
    );

    if ( $Param{Debug} ) {
        $Kernel::OM->Get('Automation')->LogDebug(
            Referrer => $Self,
            Message  => "executing request: ".$Request->as_string,
            UserID   => $Param{UserID}
        );
    }

    # execute the request
    my $Response = $UserAgent->request($Request);

    if ( $Param{Debug} ) {
        $Kernel::OM->Get('Automation')->LogDebug(
            Referrer => $Self,
            Message  => "response: ".$Response->as_string(),
            UserID   => $Param{UserID}
        );
    }

    if ( $Response->is_success ) {
        $Kernel::OM->Get('Automation')->LogInfo(
            Referrer => $Self,
            Message  => "Request successful. Status: ".$Response->status_line,
            UserID   => $Param{UserID}
        );
        return $Response;
    }
    else {
        $Kernel::OM->Get('Automation')->LogInfo(
            Referrer => $Self,
            Message  => "Request failed! Status: ".$Response->status_line."(Content: ".$Response->decoded_content.")",
            UserID   => $Param{UserID}
        );
        return $Response;
    }
}

sub _PrepareContent {
    my ( $Self, %Param ) = @_;

    my @Content = ();

    for my $Key ( sort( keys( %{ $Param{FormData} } ) ) ) {
        if ( IsString( $Param{FormData}->{ $Key } ) ) {
            push( @Content, ( $Key => $Param{FormData}->{ $Key } ) );
        }
        elsif ( IsHashRefWithData( $Param{FormData}->{ $Key } ) ) {
            my $FileRef = [
                undef,
                $Param{FormData}->{ $Key }->{Filename} || '',
                'content-type' => $Param{FormData}->{ $Key }->{ContentType},
                'content'      => MIME::Base64::decode_base64($Param{FormData}->{ $Key }->{Content})
            ];

            push( @Content, ( $Key => $FileRef ) );
        }
    }

    return \@Content;
}

1;

=back

=head1 TERMS AND CONDITIONS

This software is part of the KIX project
(L<https://www.kixdesk.com/>).

This software comes with ABSOLUTELY NO WARRANTY. For details, see the enclosed file
LICENSE-AGPL for license information (AGPL). If you did not receive this file, see

<https://www.gnu.org/licenses/agpl.txt>.

=cut
