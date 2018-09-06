$(function () {
    // components
    md_form = {
        init: function () {
            md_form.inputs();
            md_form.char_words_counter();
        },
        inputs: function (parent) {
            var $mdInput = (typeof parent === 'undefined') ? $('.md-input') : $(parent).find('.md-input');
            $mdInput.each(function () {
                if (!$(this).closest('.md-input-wrapper').length) {
                    var $this = $(this);

                    if ($this.prev('label').length) {
                        $this.prev('label').addBack().wrapAll('<div class="md-input-wrapper"/>');
                    }
                    else if ($this.siblings('[data-uk-form-password]').length) {
                        $this.siblings('[data-uk-form-password]').addBack().wrapAll('<div class="md-input-wrapper"/>');
                    }
                    else {
                        $this.wrap('<div class="md-input-wrapper"/>');
                    }

                    $this.closest('.md-input-wrapper').append('<span class="md-input-bar"/>');

                    md_form.update_input($this);
                }
                $('body')
                    .on('focus', '.md-input', function () {
                        $(this).closest('.md-input-wrapper').addClass('md-input-focus');
                    })
                    .on('blur', '.md-input', function () {
                        $(this).closest('.md-input-wrapper').removeClass('md-input-focus');
                        if (!$(this).hasClass('label-fixed')) {
                            if ($(this).val() !== '') {
                                $(this).closest('.md-input-wrapper').addClass('md-input-filled');
                            } else {
                                $(this).closest('.md-input-wrapper').removeClass('md-input-filled');
                            }
                        }
                    })
                    .on('change', '.md-input', function () {
                        md_form.update_input($(this));
                    });
            });
        },
        update_input: function (object) {
            // clear wrapper classes
            object.closest('.md-input-wrapper').removeClass('md-input-wrapper-danger md-input-wrapper-success md-input-wrapper-disabled');

            if (object.hasClass('md-input-danger')) {
                object.closest('.md-input-wrapper').addClass('md-input-wrapper-danger');
            }
            if (object.hasClass('md-input-success')) {
                object.closest('.md-input-wrapper').addClass('md-input-wrapper-success');
            }
            if (object.prop('disabled')) {
                object.closest('.md-input-wrapper').addClass('md-input-wrapper-disabled');
            }
            if (object.hasClass('label-fixed')) {
                object.closest('.md-input-wrapper').addClass('md-input-filled');
            }
            if (object.val() !== '') {
                object.closest('.md-input-wrapper').addClass('md-input-filled');
            }
        },
        char_words_counter: function () {
            var $imputCount = $('.input-count');
            if ($imputCount.length) {
                /* http://qwertypants.github.io/jQuery-Word-and-Character-Counter-Plugin/ */
                (function ($) {
                    "use strict";
                    $.fn.extend({
                        counter: function (options) {
                            var defaults = {
                                type: "char",
                                count: "down",
                                goal: 140,
                                text: true,
                                target: false,
                                append: true,
                                translation: "",
                                msg: "",
                                container_class: ""
                            };
                            var $countObj = "", countIndex = "", noLimit = false,
                                options = $.extend({}, defaults, options);
                            var methods = {
                                init: function ($obj) {
                                    var objID = $obj.attr("id"), counterID = objID + "_count";
                                    methods.isLimitless();
                                    $countObj = $("<span id=" + counterID + "/>");
                                    var counterDiv = $("<div/>").attr("id", objID + "_counter").append($countObj).append(" " + methods.setMsg());
                                    if (options.container_class && options.container_class.length) {
                                        counterDiv.addClass(options.container_class)
                                    }
                                    if (!options.target || !$(options.target).length) {
                                        options.append ? counterDiv.insertAfter($obj) : counterDiv.insertBefore($obj)
                                    } else {
                                        options.append ? $(options.target).append(counterDiv) : $(options.target).prepend(counterDiv)
                                    }
                                    methods.bind($obj)
                                }, bind: function ($obj) {
                                    $obj.bind("keypress.counter keydown.counter keyup.counter blur.counter focus.counter change.counter paste.counter", methods.updateCounter);
                                    $obj.bind("keydown.counter", methods.doStopTyping);
                                    $obj.trigger("keydown")
                                }, isLimitless: function () {
                                    if (options.goal === "sky") {
                                        options.count = "up";
                                        noLimit = true;
                                        return noLimit
                                    }
                                }, setMsg: function () {
                                    if (options.msg !== "") {
                                        return options.msg
                                    }
                                    if (options.text === false) {
                                        return ""
                                    }
                                    if (noLimit) {
                                        if (options.msg !== "") {
                                            return options.msg
                                        } else {
                                            return ""
                                        }
                                    }
                                    this.text = options.translation || "character word left max";
                                    this.text = this.text.split(" ");
                                    this.chars = "s ( )".split(" ");
                                    this.msg = null;
                                    switch (options.type) {
                                        case"char":
                                            if (options.count === defaults.count && options.text) {
                                                this.msg = this.text[0] + this.chars[1] + this.chars[0] + this.chars[2] + " " + this.text[2]
                                            } else if (options.count === "up" && options.text) {
                                                this.msg = this.text[0] + this.chars[0] + " " + this.chars[1] + options.goal + " " + this.text[3] + this.chars[2]
                                            }
                                            break;
                                        case"word":
                                            if (options.count === defaults.count && options.text) {
                                                this.msg = this.text[1] + this.chars[1] + this.chars[0] + this.chars[2] + " " + this.text[2]
                                            } else if (options.count === "up" && options.text) {
                                                this.msg = this.text[1] + this.chars[1] + this.chars[0] + this.chars[2] + " " + this.chars[1] + options.goal + " " + this.text[3] + this.chars[2]
                                            }
                                            break;
                                        default:
                                    }
                                    return this.msg
                                }, getWords: function (val) {
                                    if (val !== "") {
                                        return $.trim(val).replace(/\s+/g, " ").split(" ").length
                                    } else {
                                        return 0
                                    }
                                }, updateCounter: function (e) {
                                    var $this = $(this);
                                    if (countIndex < 0 || countIndex > options.goal) {
                                        methods.passedGoal($this)
                                    }
                                    if (options.type === defaults.type) {
                                        if (options.count === defaults.count) {
                                            countIndex = options.goal - $this.val().length;
                                            if (countIndex <= 0) {
                                                $countObj.text("0")
                                            } else {
                                                $countObj.text(countIndex)
                                            }
                                        } else if (options.count === "up") {
                                            countIndex = $this.val().length;
                                            $countObj.text(countIndex)
                                        }
                                    } else if (options.type === "word") {
                                        if (options.count === defaults.count) {
                                            countIndex = methods.getWords($this.val());
                                            if (countIndex <= options.goal) {
                                                countIndex = options.goal - countIndex;
                                                $countObj.text(countIndex)
                                            } else {
                                                $countObj.text("0")
                                            }
                                        } else if (options.count === "up") {
                                            countIndex = methods.getWords($this.val());
                                            $countObj.text(countIndex)
                                        }
                                    }
                                    return
                                }, doStopTyping: function (e) {
                                    var keys = [46, 8, 9, 35, 36, 37, 38, 39, 40, 32];
                                    if (methods.isGoalReached(e)) {
                                        if (e.keyCode !== keys[0] && e.keyCode !== keys[1] && e.keyCode !== keys[2] && e.keyCode !== keys[3] && e.keyCode !== keys[4] && e.keyCode !== keys[5] && e.keyCode !== keys[6] && e.keyCode !== keys[7] && e.keyCode !== keys[8]) {
                                            if (options.type === defaults.type) {
                                                return false
                                            } else if (e.keyCode !== keys[9] && e.keyCode !== keys[1] && options.type != defaults.type) {
                                                return true
                                            } else {
                                                return false
                                            }
                                        }
                                    }
                                }, isGoalReached: function (e, _goal) {
                                    if (noLimit) {
                                        return false
                                    }
                                    if (options.count === defaults.count) {
                                        _goal = 0;
                                        return countIndex <= _goal ? true : false
                                    } else {
                                        _goal = options.goal;
                                        return countIndex >= _goal ? true : false
                                    }
                                }, wordStrip: function (numOfWords, text) {
                                    var wordCount = text.replace(/\s+/g, " ").split(" ").length;
                                    text = $.trim(text);
                                    if (numOfWords <= 0 || numOfWords === wordCount) {
                                        return text
                                    } else {
                                        text = $.trim(text).split(" ");
                                        text.splice(numOfWords, wordCount, "");
                                        return $.trim(text.join(" "))
                                    }
                                }, passedGoal: function ($obj) {
                                    var userInput = $obj.val();
                                    if (options.type === "word") {
                                        $obj.val(methods.wordStrip(options.goal, userInput))
                                    }
                                    if (options.type === "char") {
                                        $obj.val(userInput.substring(0, options.goal))
                                    }
                                    if (options.type === "down") {
                                        $countObj.val("0")
                                    }
                                    if (options.type === "up") {
                                        $countObj.val(options.goal)
                                    }
                                }
                            };
                            return this.each(function () {
                                methods.init($(this))
                            })
                        }
                    })
                })(jQuery);

                $imputCount.each(function () {
                    var $this = $(this);

                    var $thisGoal = $(this).attr('maxlength') ? $(this).attr('maxlength') : 80;

                    $this.counter({
                        container_class: 'text-count-wrapper',
                        msg: ' / ' + $thisGoal,
                        goal: $thisGoal,
                        count: 'up'
                    });

                    if ($this.closest('.md-input-wrapper').length) {
                        $this.closest('.md-input-wrapper').addClass('md-input-wrapper-count');
                    }
                });
            }
        }
    };
    button_radio = {
        init: function () {
            $(document).on('click', "[button-radio] [type=radio]", function () {
                var wrapper = $(this).parents('[button-radio]');
                $(wrapper).find('.uk-active').removeClass('uk-active');
                $(wrapper).find("input:checked").parent().addClass('uk-active');
            });
            $("[button-radio] [type=radio]:checked").trigger('click');
        },
        stop: function () {
            $(document).off('click', "[button-radio] [type=radio]");
        }
    };

    // init
    md_form.init();
    button_radio.init();

    // helpers
    $(document).on('reset-scrolling','.not-scrolling',function () {
        $(".not-scrolling").scrollTop(0);
    }).trigger('reset-scrolling');
});


/**
 * Check if the variable is empty
 *
 * @param {*} variable
 * @returns {boolean}
 */
function empty(variable) {
    return (variable == undefined || variable == null || variable.length <= 0) ? true : false;
}

/**
 * Returns the base URL with the current segment and, if passed, append another segment path.
 * To rewrite the current segment path, set the second parameter to true
 *
 * @param {string} [segment_path]
 * @param {boolean} [replace]
 * @returns {string}
 */
function url(segment_path, replace) {
    segment_path = empty(segment_path) ? '' : segment_path;
    replace = empty(replace) ? false : replace;

    var url = window.location.href,
        last_separator = n = url.lastIndexOf("/");

    if(replace || ++(last_separator) == url.length)
        url = url.substring(0,n);

    url += '/';
    url += segment_path;
    return url;
}

/**
 * Return the base URL with, if passed, the segment path
 *
 * @param {string} [segment_path]
 * @returns {string}
 */
function base_url(segment_path) {
    segment_path = empty(segment_path) ? '' : segment_path;
    var url  = document.location.origin;

    url += '/';
    url += segment_path;
    return url;
}

/**
 * Redirect the browser to the url passed
 *
 * @param {string} url
 * @returns {callback}
 */
function redirect(url) {
    window.location.href = url;
}

/**
 * Prototype of global object String for capitalizing the string
 *
 * @example
 *      "hello world".capitalize(); => "Hello world"
 *
 * @memberof String
 * @type {object}
 * @namespace String.capitalize
 */
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};