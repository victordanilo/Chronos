$(function () {
    task = {
        init: function () {
            this.status.init();

            // open bar new task
            $(document).on('click', "#open-new-task", function () {
                $("#create-task-wrapper").addClass('active');
                $("#main-content").addClass('not-scrolling').trigger('reset-scrolling');
            });

            // close bar new task
            $(document).on('click', '#btn-task-close', function () {
                $("#create-task-wrapper").removeClass('active');
                $("#main-content").removeClass('not-scrolling');
            });
        },
        stop: function () {
            this.status.stop();

            $(document).off('click', "#open-new-task");
            $(document).off('click', '#btn-task-close');
        },
        status: {
            target: null,

            init: function () {
                this.load_list();

                // selected status
                $(document).on('click', '.status-list-item > .status-name', function () {
                    var target = $(this).parents('.dropdown');
                    var status_id = $(this).parents('.status-list-item').attr('status-id');

                    task.status.selected(status_id,target);
                });

                // open more options
                $(document).on('click', '.status-btn-more', function () {
                    task.status.target = $(this).parents('.status-list-item');
                    task.status.open_more_options();
                });

                // close more options
                $(document).on('click', '.status-more-options-close', function () {
                    task.status.close_more_options();
                });

                // open color palette
                $(document).on('click', '.status-change-color', function () {
                    var $target = $(this).parents('li.status-list-item').children('.palette-colors-wrapper');
                    task.status.open_color_palette($target);
                });

                // changer color of status
                $(document).on('click', '.palette-colors-content > li', function () {
                    var status_id = $(this).parents('li.status-list-item').attr('status-id');
                    var status_color = $(this).attr('bg-color');

                    task.status.changer_color(status_id, status_color);
                    task.status.close_color_palette();
                });

                // save new status
                $(document).on('click', '#new-status-save', function () {
                    var id = Number(status_list[(status_list.length - 1)].id) + 1;
                    var name = $("#new-status-input").val();
                    var color =  $("#new-status .palette-colors li.active").attr('bg-color');

                    if(empty(name)) {
                        UIkit.notification({
                            message: 'set status name',
                            status: 'danger',
                            pos: 'top-center',
                            timeout: 5000
                        });
                        $("#new-status-input").focus();
                        return false;
                    }

                    task.status.add(id,name,color);
                    UIkit.modal("#new-status").hide();

                    return false;
                });
                $(document).on('beforeshow', '#new-status', function () {
                    var key = random(0,7);
                    $("#new-status .palette-colors > li").removeClass('active').html('');
                    $($("#new-status .palette-colors li")[key]).addClass('active').html('<span class="uk-position-center" uk-icon="icon: check"></span>');
                    $("#new-status-input").val('');
                });
                $(document).on('click', '#new-status .palette-colors > li', function () {
                    $("#new-status .palette-colors > li").removeClass('active').html('');
                    $(this).addClass('active').html('<span class="uk-position-center" uk-icon="icon: check"></span>');
                });

                // remove status
                $(document).on('click', '.status-more-options-content .status-remove', function () {
                    var status_id = task.status.target.attr('status-id');

                    task.status.remove(status_id);
                    task.status.close_more_options();
                    return false;
                });

                // edit status name
                $(document).on('click', '.status-more-options-content .status-edit', function () {
                    task.status.open_edit_status();
                });

                // salve status name
                $(document).on('click', '.status-btn-confirm-edit', function () {
                    var status_id = task.status.target.attr('status-id');
                    var status_name = task.status.target.children('.status-name').text();

                    task.status.edit(status_id, status_name);
                    task.status.close_edit_status();
                });

                // events blur
                $(document).on('open-more-options open-color-palette', function () {
                    $(document).on('click.status_list','body',function (event) {
                        var status = $(event.target).closest(task.status.target).length;

                        if(!status) {
                           task.status.close_color_palette();
                           task.status.close_more_options();
                        }
                    });
                });
                $(document).on('close-more-options close-color-palette', function () {
                    $(document).off('click.status_list','body');
                });

                // close dropdown
                $(document).on('close-dropdown', function () {
                    task.status.close_more_options();
                    task.status.close_color_palette();
                    task.status.close_edit_status();
                });
            },
            stop: function () {
            },
            add: function (id, name, color) {
                var data = {status_id : id, status_name: name, status_color: color};
                var template = $("#status_item_template").html();
                var status_item = Mustache.render(template,data);

                // add status in  status-list of dropdown
                $(".status-list").append(status_item);
                $('.status-list > li[status-id='+id+'] .palette-colors-content > li[bg-color='+color+']').append($('<span uk-icon="icon: check"></span>'));

                // add in global list
                status_list.push({'id': id, 'name': name, 'color': color});
            },
            build_content: function (status_id__selected) {
                var $status_list = $('<div/>');
                var template = $("#status_item_template").html();
                Mustache.parse(template);

                $.each(status_list, function (i, status) {
                    var status_active = status_id__selected == status.id ? 'active' : '';
                    var data = {status_id: status.id, status_name: status.name, status_color: status.color, status_active: status_active};
                    $status_list.append(Mustache.render(template,data));
                });

                return $status_list.html();
            },
            load_list: function () {
                $.ajax({
                    url: base_url('data/status.json'),
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        // load list
                        $.each(data, function (i, status_item) {
                            task.status.add(status_item.id, status_item.name, status_item.color);
                        });

                        // load status
                        $('.task-status').each(function (i,element) {
                            var $status = $(element);
                            var status_id = $status.attr('status-id');
                            $status.siblings('.dropdown').find('.status-list').children('li[status-id='+status_id+']').addClass('active');
                        });
                    }
                });
            },
            remove: function (id) {
                // remove status from  status-list of dropdown
                $('.status-list > li[status-id='+id+']').remove();

                // remove status from task
                if($('.task-status[dropdown][status-id='+id+']').length) {
                    $('.task-status[dropdown][status-id='+id+']').each(function (i,element) {
                        var $this = $(element);
                        var $status = $this.siblings('.dropdown').find('.status-list').children('.status-list-item')[0];
                        var status_id = $($status).attr('status-id');
                        var status = search_array(status_id,'id',status_list);

                        $this.attr('status-id',status_id)
                             .attr('bg-color',status.color)
                             .children('.task-status-name').text(status.name);

                        $($status).addClass('active');
                    }) ;
                }

                // remove status from global list
                var index = null;
                $.each(status_list,function (i, status_item) {
                    if(id == status_item.id) {
                        index = i;
                        return;
                    }
                });
                status_list.splice(index,1);
            },
            edit: function (id, name) {
                $('.task-status[status-id='+id+']').children('.task-status-name').text(name);
                $('.status-list > li[status-id='+id+']').children('.status-name').text(name);

                $.each(status_list, function (i, status_item) {
                    if(id == status_item.id) {
                        status_list[i].name = name;
                    }
                });
            },
            changer_color: function (id,color) {
                $('.task-status[status-id='+id+']').attr('bg-color',color);
                $('.status-list > li[status-id='+id+'] .status-indicator').attr('bg-color',color);
                $('.status-list > li[status-id='+id+'] .palette-colors-content > li').html('');
                $('.status-list > li[status-id='+id+'] .palette-colors-content > li[bg-color='+color+']').append($('<span uk-icon="icon: check"></span>'));

                $.each(status_list, function (i, status_item) {
                    if(id == status_item.id) {
                        status_list[i].color = color;
                    }
                });
            },
            selected: function (status_id, target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target : null;

                if(empty(target))
                    return;

                var status = search_array(status_id, 'id', status_list);
                var button = target.siblings('.task-status');

                button
                      .attr('status-id',status_id)
                      .attr('bg-color', status.color)
                      .children('.task-status-name').text(status.name);

                target.find('.status-list > .status-list-item.active').removeClass('active');
                target.find('.status-list > .status-list-item[status-id='+status_id+']').addClass('active');
            },
            open_more_options: function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target.children('.status-more-options-wrapper'): null;

                if(empty(target))
                    return;

                this.refresh();

                $(document).trigger('open-more-options');
                target.show();
            },
            close_more_options: function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target.children('.status-more-options-wrapper') : $('.status-more-options-wrapper');
                $(document).trigger('close-more-options');
                target.hide();
            },
            open_color_palette: function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target.children('.palette-colors-wrapper') : null;

                if(empty(target))
                    return;

                this.close_more_options();

                $(document).trigger('open-color-palette');
                target.show();
            },
            close_color_palette: function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target.children('.palette-colors-wrapper') : $('.palette-colors-wrapper');
                $(document).trigger('close-color-palette');
                target.hide();
            },
            open_edit_status: function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target : null;

                if(empty(target))
                    return;

                this.close_more_options();

                $(document).trigger('open-edit-status');
                target.addClass("edit").children('.status-name').attr('contenteditable', 'true').focus()
                      .enterKey(function () {
                          $('.status-btn-confirm-edit').trigger('click');
                      });
            },
            close_edit_status: function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target : $('.status-list > li');

                $(document).trigger('close-edit-status');
                target.removeClass("edit").children('.status-name').attr('contenteditable', 'false');
            },
            refresh: function () {
                if(empty(this.target))
                    return;

                var more_options  = $('.status-more-options-wrapper').not(this.target.children('.status-more-options-wrapper'));
                var color_palette = $('.palette-colors-wrapper').not(this.target.children('.palette-colors-wrapper'));
                var edit_status   = $('.status-list > li').not(this.target);

                if(more_options.is(":visible"))
                    this.close_color_palette(more_options);

                if(color_palette.is(":visible"))
                    this.close_color_palette(color_palette);

                if(edit_status.hasClass('edit'))
                    this.close_edit_status(edit_status);
            }
        },
    };

    // init
    task.init();
});

// set data initial
status_list = [];

// custom datepicker
$.datepicker.setDefaults({
    dateFormat: 'dd/mm/y',
    beforeShow: function (input, inst) {
        $(input).prop('disabled', true);
    },
    onClose: function () {
        var inst = $.datepicker._curInst;
        $(inst.input).prop('disabled', false);

        overlay.close();
    }
});
$.datepicker._pre_generateHTML = $.datepicker._generateHTML;
$.datepicker._generateHTML = function (inst) {
    var html = this._pre_generateHTML(inst);
    html = html.replace('<span class=\'ui-icon ui-icon-circle-triangle-w\'>Prev</span>','<span uk-icon="icon:chevron-left; ratio: 1.4"></span>');
    html = html.replace('<span class=\'ui-icon ui-icon-circle-triangle-e\'>Next</span>','<span uk-icon="icon:chevron-right; ratio: 1.4"></span>');

    if($(window).width() < 960) {
        $("#ui-datepicker-div").addClass('fullscreen');
        overlay.open();
    }

    return html;
};
