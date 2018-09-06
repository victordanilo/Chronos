$(function () {
    // main common
    aside = {
        init: function () {
            $(document).on('click', '.controls-nav', function () {
                var status = $('aside').hasClass('expand');

                if(status)
                    aside.collapse();
                else
                    aside.expand();
            });
        },
        stop: function () {
            $(document).off('click', '.controls-nav');
        },
        expand: function () {
            $('aside').removeClass('collapse');
            $('aside').addClass('expand');
            $('main').removeClass('expand');
            $('main').addClass('collapse');
            $('.controls-nav').attr('uk-icon','icon: arrow-left');
        },
        collapse: function () {
            $('aside').removeClass('expand');
            $('aside').addClass('collapse');
            $('main').removeClass('collapse');
            $('main').addClass('expand');
            $('.controls-nav').attr('uk-icon','icon: arrow-right');
        },
        enable: function () {
            $('body > div').removeClass('aside-disable');
        },
        disable: function () {
            $('body > div').addClass('aside-disable');
        },
    };
    dock = {
        init: function () {
            dock.menu.init();
            dock.notify.init();
            dock.refresh();
        },
        stop: function () {
            dock.menu.stop();
            dock.notify.stop();
        },
        menu: {
            init: function () {
                $(document).on('click', 'nav#dock li#open-menu', function () {
                    var status = $('nav#menu').is(":visible");

                    if(status)
                        dock.menu.close();
                    else
                        dock.menu.open();
                });
            },
            stop: function () {
                $(document).off('click', 'nav#dock li#open-menu');
            },
            open: function () {
                $('nav#menu').addClass('active');
                $('nav#dock li#open-menu').addClass('active');
                $('main,aside').hide();
            },
            close: function () {
                $('nav#menu').removeClass('active');
                $('nav#dock li#open-menu').removeClass('active');
                $('main,aside').show();
            }
        },
        notify: {
            init: function () {
                $(document).on('click', 'nav#dock li#open-notify', function () {
                    var status = $('div#notify').is(":visible");

                    if (status)
                        dock.notify.close();
                    else
                        dock.notify.open();
                });
            },
            stop: function () {
                $(document).off('click', 'nav#dock li#open-notify');
            },
            open: function () {
                $('div#notify').addClass('active');
                $('nav#dock li#open-notify').addClass('active');
                $('main,aside').hide();
            },
            close: function () {
                $('div#notify').removeClass('active');
                $('nav#dock li#open-notify').removeClass('active');
                $('main,aside').show();
            }
        },
        refresh: function () {
            $('nav#dock li').on('click', function () {
                var active = $("nav#dock li.active").attr('data');
                var $this = $(this).attr('data');

                if(!empty(active) && active != $this)
                    eval('dock.'+active+'.close()');
            });
        },
    };

    // init
    aside.init();
    dock.init();
});