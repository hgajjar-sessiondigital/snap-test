var _HDM_SessionExpire = (function($) {
    'use strict';

    var _elementSelector = '#session_expire',
        _bgSelector= '.session-expire-bg',
        _boxSelector= '.session-expire-box-wrapper',
        _titleSelector = '.session-expire-title',
        _countdownSelector = '.session-expire-countdown',
        _loginButtonSelector = '#session_expire a.login',
        _logoutButtonSelector = '#session_expire a.logout',
        _isShown = false,
        _timeout = null,
        _countdown = null,
        _liveCountdown = null,
        _liveCountdownHandle = null,
        _endCountdownHandle = null;

    var reposition = function () {
        if (_isShown) {
            var windowHeight = $(window).height(),
                documentHeight = $(document).height(),
                boxHeight = $(_boxSelector).height();
            $(_boxSelector).css('top', (windowHeight - boxHeight) / 2);
            $(_bgSelector).css('height', documentHeight);
        }
    };
    
    return {
        init: function(timeout, countdown) {
            // seconds to miliseconds
            _timeout = timeout*1000;
            _countdown = countdown*1000;

            $(window).on('resize', function(){reposition()});

            // hook the Continue (Login) and Logout buttons
            $(_loginButtonSelector).on('click', (function (e) {
                e.preventDefault();
                this.cleanup();
                $(_titleSelector).text(Translator.translate('Refreshing shopping session ...'));

                document.getElementById("session_expire_frame").contentWindow.document.location.href = $(_loginButtonSelector).attr("href");
            }).bind(this));
            $(_logoutButtonSelector).on('click', (function () {
                this.cleanup();
                $(_titleSelector).text(Translator.translate('Logging out ...'));
            }).bind(this));

            this.setTimeout();
        },

        show: function() {
            _isShown = true;
            $(_titleSelector).html(Translator.translate('Your session is about to expire!<br />Do you wish to continue shopping?'));
            $(_countdownSelector).show();
            $(_loginButtonSelector).show();
            $(_logoutButtonSelector).show();
            $(_elementSelector).show();
            reposition();
        },

        hide: function() {
            _isShown = false;
            $(_elementSelector).hide();
        },

        setTimeout: function() {
            var realTimeout = _timeout - _countdown;
            if (0 > realTimeout) {
                _countdown = _countdown + realTimeout;
                realTimeout = 0;
            }

            // start the timeout (till popup dialog is displayed)
            window.setTimeout(this.startCountdown.bind(this), realTimeout);
            //console.log("real timeout: " + realTimeout);
        },

        startCountdown: function() {
            // miliseconds to seconds (for display)
            _liveCountdown = Math.round(_countdown / 1000);

            this.displayCountdown();
            this.show();

            // start live countdown
            _liveCountdownHandle = window.setInterval(this.displayCountdown, 1000);

            // set end of live countdown
            _endCountdownHandle =  window.setTimeout(this.endCountdown.bind(this), _countdown);
        },

        endCountdown: function() {
            this.cleanup();
            $(_titleSelector).text(Translator.translate('Logging out ...'));
            document.location.href = $(_logoutButtonSelector).data("href-auto-logout");
        },

        cleanup: function() {
            window.clearTimeout(_endCountdownHandle);
            window.clearInterval(_liveCountdownHandle);

            $(_loginButtonSelector).hide();
            $(_logoutButtonSelector).hide();
            $(_countdownSelector).hide();
        },

        displayCountdown: function() {
            _liveCountdown -= 1;
            _liveCountdown = (0 > _liveCountdown) ? 0 : _liveCountdown;

            var minutes = Math.floor(_liveCountdown / 60);
            var seconds = _liveCountdown % 60;

            minutes = ("00" + minutes.toString()).slice(-2);
            seconds = ("00" + seconds.toString()).slice(-2);
            var display =  minutes + "m : " + seconds + "s";

            $(_countdownSelector).text(display);
        },

        loginHasFailed: function() {
            $(_titleSelector).html(Translator.translate('Refreshing shopping session failed!') + '<br />' + Translator.translate('Logging out ...'));
            document.location.href = $(_logoutButtonSelector).data("href-auto-logout");
        }
    }
})(jQuery);
