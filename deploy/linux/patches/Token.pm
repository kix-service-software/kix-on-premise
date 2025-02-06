# --
# Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com 
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file LICENSE-GPL3 for license information (GPL3). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --

package Kernel::System::Token;

use strict;
use warnings;
use JSON::MaybeXS;
use JSON::WebToken;

use Kernel::Language qw(Translatable);
use Kernel::System::VariableCheck qw(:all);

our @ObjectDependencies = (
    'Config',
    'Log',
    'Main',
);

=head1 NAME

Kernel::System::Token - handling of user session tokens

=head1 SYNOPSIS

All token functions.

=head1 PUBLIC INTERFACE

=over 4

=cut

=item new()

create an object. Do not use it directly, instead use:

    use Kernel::System::ObjectManager;
    local $Kernel::OM = Kernel::System::ObjectManager->new();
    my $TokenObject = $Kernel::OM->Get('Token');

=cut

sub new {
    my ( $Type, %Param ) = @_;

    # allocate new hash for object
    my $Self = {};
    bless( $Self, $Type );

    return $Self;
}

=item ValidateToken()

validates a token, returns the payload (valid) or nothing (invalid)

    my $Result = $TokenObject->ValidateToken(
        Token => '1234567890123456',
    );

=cut

sub ValidateToken {
    my ( $Self, %Param ) = @_;

    use Data::Dumper;
    print STDERR "ValidateToken: ".Data::Dumper::Dumper(\%Param);

    # check session id
    if ( !$Param{Token} ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got no token!!'
        );
        return;
    }
    my $RemoteAddr = $ENV{REMOTE_ADDR} || 'none';

    # get config object
    my $ConfigObject = $Kernel::OM->Get('Config');

    print STDERR "calling prepare!\n";
    # check whitelist
    $Kernel::OM->Get('DB')->Prepare(
        SQL => "SELECT token, last_request_time FROM token WHERE token = ?",
        Bind => [ \$Param{Token} ],
    );

    print STDERR "calling FetchrowArray!\n";

    my $TokenFound = 0;
    my $LastRequestTimeUnix;
    while ( my @Row = $Kernel::OM->Get('DB')->FetchrowArray() ) {
	    print STDERR "Row: ".Data::Dumper::Dumper(\@Row);
        $TokenFound = $Row[0];

        if ( $Row[1] ) {
            $LastRequestTimeUnix = $Kernel::OM->Get('Time')->TimeStamp2SystemTime(
                String => $Row[1],
            );
        }
    }

    # nothing found, this token is invalid
    if ( !$TokenFound ) {
        return;
    }

    # decode token
    my $Payload = decode_jwt(
        $Param{Token},
        $ConfigObject->Get('TokenSecret') || '###KIX_TOKEN_SECRET!!!',
    );

    # unable to decode
    if ( !IsHashRefWithData($Payload) ) {
        return;
    }

    # remote ip check
    if (
        $ConfigObject->Get('TokenCheckRemoteIP') &&
        $Payload->{RemoteIP} ne '0.0.0.0' &&
        $Payload->{RemoteIP} ne $RemoteAddr
        )
    {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'notice',
            Message  => "RemoteIP ($Payload->{RemoteIP}) of request is "
                . "different from registered IP ($RemoteAddr). Invalidating token! "
                . "Disable config 'TokenCheckRemoteIP' if you don't want this!",
        );

        $Self->RemoveToken( Token => $Param{Token} );

        return;
    }

    # check time validity
    my $TimeNow = $Kernel::OM->Get('Time')->SystemTime();

    if ( $TimeNow > $Payload->{ValidUntilTimeUnix} ) {

        $Kernel::OM->Get('Log')->Log(
            Priority => 'notice',
            Message  => "Token valid time exceeded!",
        );

        $Self->RemoveToken( Token => $Param{Token} );

        return;
    }

    # check idle time
    if ($LastRequestTimeUnix && !$Payload->{IgnoreMaxIdleTime}) {
        my $TokenMaxIdleTime = $ConfigObject->Get('TokenMaxIdleTime');

        if ( ( $TimeNow - $TokenMaxIdleTime ) >= $LastRequestTimeUnix ) {

            $Kernel::OM->Get('Log')->Log(
                Priority => 'notice',
                Message =>
                    "Token maximum idle time exceeded!",
            );

            $Self->RemoveToken( Token => $Param{Token} );

            return;
        }
    }

    # update last request time
    $TimeNow = $Kernel::OM->Get('Time')->CurrentTimestamp();
    $Kernel::OM->Get('DB')->Prepare(
        SQL => "UPDATE token SET last_request_time = ? WHERE token = ?",
        Bind =>  [
            \$TimeNow,
            \$Param{Token}
        ],
    );

    return $Payload;
}

=item CreateToken()

create a new token with given data

    my $Token = $TokenObject->CreateToken(
        Payload => {
            UserType    => 'User' | 'Customer'     # required
            UserID      => '...'                   # required
            TokenType   => 'AccessToken',          # optional, used to create special AccessTokens
            ValidUntil  => 'YYYY-MM-YY HH24:MI:SS' # optional, used to create special AccessTokens
            RemoteIP    => '...'                   # optional, used to create special AccessTokens
            IgnoreMaxIdleTime => '...'             # optional, used to create special AccessTokens
            PermittedOperations => {}              # optional, used to create special AccessTokens
            DeniedOperations => {}                 # optional, used to create special AccessTokens
            Description => '...'                   # optional, used to create special AccessTokens
        }
    );

=cut

sub CreateToken {
    my ( $Self, %Param ) = @_;

    if ( !IsHashRefWithData($Param{Payload}) ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got no Payload!'
        );
        return;
    }

    if ( !$Param{Payload}->{UserType} ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got no UserType!'
        );
        return;
    }

    if ( $Param{Payload}->{UserType} ne 'Agent' && $Param{Payload}->{UserType} ne 'Customer' ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got wrong UserType!'
        );
        return;
    }

    if ( !$Param{Payload}->{UserID} ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got no UserID!'
        );
        return;
    }

    # enrich payload and create token
    my $TimeObject = $Kernel::OM->Get('Time');

    my $ValidUntilTimeUnix;
    if ( $Param{Payload}->{ValidUntil} ) {
        $ValidUntilTimeUnix = $TimeObject->TimeStamp2SystemTime(
            String => $Param{Payload}->{ValidUntil},
        );
    }

    if ( !$ValidUntilTimeUnix ) {
        $ValidUntilTimeUnix = $TimeObject->SystemTime() + $Kernel::OM->Get('Config')->Get('TokenMaxTime');
    }

    my %Payload = %{$Param{Payload}};
    my $CreateTimeString           = $TimeObject->CurrentTimestamp();
    $Payload{CreateTimeUnix}       = $TimeObject->SystemTime();
    $Payload{ValidUntilTimeUnix}   = $ValidUntilTimeUnix;
    $Payload{RemoteIP}             = $Param{Payload}->{RemoteIP} || $ENV{REMOTE_ADDR} || 'none';
    $Payload{IgnoreMaxIdleTime}    = ($Param{Payload}->{IgnoreMaxIdleTime} || 0) + 0;
    $Payload{Description}          = $Param{Payload}->{Description} || '';
    $Payload{TokenType}            = $Param{Payload}->{TokenType} || 'Normal';
    $Payload{AllowedOperations}    = $Param{Payload}->{AllowedOperations} || [];
    $Payload{DeniedOperations}     = $Param{Payload}->{DeniedOperations} || [];

    my $Token = encode_jwt(
        \%Payload,
        $Kernel::OM->Get('Config')->Get('TokenSecret') || '###KIX_TOKEN_SECRET!!!',
        'HS256',
    );

    # store token in whitelist
    $Kernel::OM->Get('DB')->Do(
        SQL  => "INSERT INTO token (token, last_request_time) values (?, current_timestamp)",
        Bind => [
            \$Token,
        ],
    );

    return $Token;
}

=item RemoveToken()

removes a token and returns true (deleted), false (if
it can't get deleted)

    $TokenObject->RemoveToken(Token => '1234567890123456');

=cut

sub RemoveToken {
    my ( $Self, %Param ) = @_;

    # check session id
    if ( !$Param{Token} ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got no Token!!'
        );
        return;
    }

    # delete token from the database
    return if !$Kernel::OM->Get('DB')->Do(
        SQL  => "DELETE FROM token WHERE token = ?",
        Bind => [ \$Param{Token} ],
    );

    # log event
    $Kernel::OM->Get('Log')->Log(
        Priority => 'debug',
        Message  => "Removed token $Param{Token}."
    );

    return 1;

}

=item ExtractToken()

returns the payload of a given token, adding LastRequestTime

    my $Payload = $TokenObject->ExtractToken(
        Token => '1234567890123456',
    );

=cut

sub ExtractToken {
    my ( $Self, %Param ) = @_;

    # check session id
    if ( !$Param{Token} ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'error',
            Message  => 'Got no token!!'
        );
        return;
    }

     # get config object
    my $ConfigObject = $Kernel::OM->Get('Config');

    # get time of last request
    $Kernel::OM->Get('DB')->Prepare(
        SQL => "SELECT token, last_request_time FROM token WHERE token = ?",
        Bind => [ \$Param{Token} ],
    );

    my $TokenFound = 0;
    my $LastRequestTimeUnix;
    while ( my @Row = $Kernel::OM->Get('DB')->FetchrowArray() ) {
        $TokenFound = $Row[0];

        if ( $Row[1] ) {
            $LastRequestTimeUnix = $Kernel::OM->Get('Time')->TimeStamp2SystemTime(
                String => $Row[1],
            );
        }
    }

    if ( !$TokenFound ) {
        $Kernel::OM->Get('Log')->Log(
            Priority => 'notice',
            Message  => 'Token not found in database!'
        );
    }

    # decode token
    my $Payload = decode_jwt(
        $Param{Token},
        $ConfigObject->Get('TokenSecret') || '###KIX_TOKEN_SECRET!!!',
    );

    # unable to decode
    if ( !IsHashRefWithData($Payload) ) {
        return;
    }

    # enrich payload
    $Payload->{LastRequestTimeUnix} = $LastRequestTimeUnix || undef;
    $Payload->{LastRequestTime} = undef;
    if ( $LastRequestTimeUnix ) {
        $Payload->{LastRequestTime} = $Kernel::OM->Get('Time')->SystemTime2TimeStamp(
            SystemTime => $LastRequestTimeUnix,
        );
    }
    $Payload->{CreateTime} = $Kernel::OM->Get('Time')->SystemTime2TimeStamp(
        SystemTime => $Payload->{CreateTimeUnix},
    );
    $Payload->{ValidUntilTime} = $Kernel::OM->Get('Time')->SystemTime2TimeStamp(
        SystemTime => $Payload->{ValidUntilTimeUnix},
    );

    return $Payload;
}

=item GetAllTokens()

returns a hashref with all tokens, key = Token, value = last request time

    my $Tokens = $TokenObject->GetAllTokens();

=cut

sub GetAllTokens {
    my ( $Self, %Param ) = @_;

    # get database object
    my $DBObject = $Kernel::OM->Get('DB');

    # get all session ids from the database
    return if !$DBObject->Prepare(
        SQL => "SELECT token, last_request_time FROM token",
    );

    # fetch the result
    my %Tokens;
    while ( my @Row = $DBObject->FetchrowArray() ) {
        $Tokens{$Row[0]} = $Row[1];
    }

    return \%Tokens;
}

=item CleanUp()

cleanup all "normal" tokens in system

    $TokensObject->CleanUp(
        TokenType => 'SomeType'   # optional, 'normal' is used if empty
    );

=cut

sub CleanUp {
    my ( $Self, %Param ) = @_;

    my %TokenList = %{$Self->GetAllTokens()};
    $Param{TokenType} ||= 'Normal';

    foreach my $Token ( keys %TokenList ) {
        my $Payload = $Self->ExtractToken(
            Token => $Token,
        );
        return if ( !IsHashRefWithData($Payload) );

        # only remove tokens of relevant type
        if ( $Payload->{TokenType} eq $Param{TokenType} ) {
            $Self->RemoveToken(
                Token => $Token,
            );
        }
    }

    return 1;
}

=item CleanUpExpired()

cleanup all expired tokens in system

    $TokensObject->CleanUpExpired();

=cut

sub CleanUpExpired {
    my ( $Self, %Param ) = @_;

    my $TimeNow = $Kernel::OM->Get('Time')->SystemTime();

    if ( $TimeNow ) {
        my $TokenMaxIdleTime = $Kernel::OM->Get('Config')->Get('TokenMaxIdleTime');

        my %TokenList = %{$Self->GetAllTokens()};
        foreach my $Token ( keys %TokenList ) {
            my $Payload = $Self->ExtractToken( Token => $Token );

            return if ( !IsHashRefWithData($Payload) );

            # check valid until time
            if ( $Payload->{ValidUntilTimeUnix} && $TimeNow > $Payload->{ValidUntilTimeUnix} ) {
                $Self->RemoveToken( Token => $Token );
                next;
            }

            # check idle time
            if (
                !$Payload->{IgnoreMaxIdleTime} && $TokenMaxIdleTime && $Payload->{LastRequestTimeUnix} &&
                ( $TimeNow - $TokenMaxIdleTime ) >= $Payload->{LastRequestTimeUnix}
            ) {
                $Self->RemoveToken( Token => $Token );
            }
        }
    }

    return 1;
}

=item CountUniqueUsers()

count unique users per user context

    my %CountHashRef = $TokensObject->CountUniqueUsers(
        StartTime => '...',
        EndTime   => '...',
        Since     => '15m',
    );

=cut

sub CountUniqueUsers {
    my ( $Self, %Param ) = @_;

    # get database object
    my $DBObject = $Kernel::OM->Get('DB');

    my $SQL = 'SELECT token FROM token WHERE 1=1';

    my @BindArr;
    if ( $Param{StartTime} ) {
        $SQL .= ' AND last_request_time >= ?';
        push @BindArr, \$Param{StartTime};
    }
    if ( $Param{EndTime} ) {
        $SQL .= ' AND last_request_time <= ?';
        push @BindArr, \$Param{EndTime};
    }
    if ( $Param{Since} ) {
        my $TargetTime = $Kernel::OM->Get('Time')->SystemTime2TimeStamp(
            SystemTime => $Kernel::OM->Get('Time')->TimeStamp2SystemTime(
                String => '-' . $Param{Since},
            )
        );

        $SQL .= ' AND last_request_time >= ?';
        push @BindArr, \$TargetTime;
    }

    # get all session ids from the database
    return if !$DBObject->Prepare(
        SQL  => $SQL,
        Bind => \@BindArr,
    );

    # fetch the result
    my @Tokens;
    while ( my @Row = $DBObject->FetchrowArray() ) {
        push @Tokens, $Row[0];
    }

    my %UniqueUsers;
    TOKEN:
    foreach my $Token ( @Tokens ) {
        my $Payload = $Self->ExtractToken(
            Token => $Token,
        );
        next TOKEN if !IsHashRefWithData($Payload);

        $UniqueUsers{$Payload->{UserType}}->{Count} //= 0;
        if ( !$UniqueUsers{$Payload->{UserType}}->{UserIDs}->{$Payload->{UserID}} ) {
            $UniqueUsers{$Payload->{UserType}}->{UserIDs}->{$Payload->{UserID}} = 1;
            $UniqueUsers{$Payload->{UserType}}->{Count}++;
        }
    }

    return %UniqueUsers;
}

1;


=back

=head1 TERMS AND CONDITIONS

This software is part of the KIX project
(L<https://www.kixdesk.com/>).

This software comes with ABSOLUTELY NO WARRANTY. For details, see the enclosed file
LICENSE-GPL3 for license information (GPL3). If you did not receive this file, see

<https://www.gnu.org/licenses/gpl-3.0.txt>.

=cut

