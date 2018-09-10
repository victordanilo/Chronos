$(function () {
    project = {
        init: function () {
            this.filter.init();
            this.list.init();
        },
        stop: function () {
            this.filter.stop();
            this.list.stop();
        },
        filter: {
            _current:null,

            init: function () {
                this.search.init();
                this.date.init();
                this.tag.init();
            },
            stop: function () {
                this.search.stop();
                this.date.stop();
                this.tag.stop();
            },
            search: {
                init: function () {
                    this.project();
                    this.client();

                    $(document).on('click',".open-filter-search", function () {
                        var status = $(this).hasClass('filter-active');
                        var type = $(this).data('type');

                        if(!status)
                            project.filter.search.open(type);
                        else
                            project.filter.search.close();
                    });
                    $(document).on('click', "#filter-search > .close", function () {
                        project.filter.search.close();
                    });
                },
                stop: function () {
                    $(document).off('click', ".open-filter-search");
                    $(document).off('click', "#filter-search > .close");
                },
                open: function (type) {
                    var type = !empty(type) ? type : 'project';
                    
                    project.filter.refresh();
                    $("#filter-buttons a[data-type="+type+"]").addClass('filter-active');
                    $("#filter-search > input")
                                               .attr("id", 'filter-search-'+type)
                                               .attr("placeholder", "Search "+type.capitalize());
                    $("#filter-search").show();
                    project.filter._current = 'search';
                },
                close: function () {                                    
                    $("#filter-buttons a").removeClass('filter-active');
                    $("#filter-search > input").attr('id','').val('').data('id','');
                    $("#filter-search").hide();
                    project.filter._current = null;
                },
                project: function () {
                    $(document).on('focus', '#filter-search-project', function () {
                        $(this).autocomplete({
                            source: function (request, response) {
                                $.ajax({
                                    url: base_url('data/project.json'),
                                    type: 'GET',
                                    dataType: 'json',
                                    success: function(data) {
                                        response($.map(data, function (item) {
                                            return {id: item.id, label: item.name, value: item.name};
                                        }));
                                    }
                                });
                            },
                        });
                    });
                },
                client: function () {
                    $(document).on('focus', '#filter-search-client', function () {
                        $(this).autocomplete({
                            source: function (request, response) {
                                $.ajax({
                                    url: base_url('data/client.json'),
                                    type: 'GET',
                                    dataType: 'json',
                                    success: function(data) {
                                        response($.map(data, function (item) {
                                            return {id: item.id, label: item.name, value: item.name};
                                        }));
                                    }
                                });
                            },
                            select: function( event, ui ) {
                                project.filter.search.close();
                                project.filter.tag.remove('client');
                                project.filter.tag.add(ui.item.value,'client','tag-first');
                                return false;
                            }
                        });
                    });
                }
            },
            date: {
                init: function () {
                    $(document).on('click','.open-filter-date', function(){
                        var has_show = $(this).hasClass('filter-active');
                        
                        if(has_show) 
                            project.filter.date.close();                    
                        else
                            project.filter.date.open();                                                                
                    });
                    
                    $(document).on('click',".tag[tag-type^='date'] .tag-remove", function(e){
                        console.log($(this).parent().attr('tag-type'));
                    });
                    
                    this.datepicker($("#filter-date-start-input"));
                    this.datepicker($("#filter-date-end-input"));                            
                },
                stop: function () {
                    $(document).off('click','.open-filter-date');
                    $(document).off('click','.tag-type-date-*');
                },            
                open: function() {
                    project.filter.refresh();                
                    $('#filter-buttons a.open-filter-date').addClass('filter-active');
                    $("#filter-date").show(); 
                    project.filter._current = 'date';                       
                },
                close:function() {                                                    
                    $('#filter-buttons a.open-filter-date').removeClass('filter-active');
                    $("#filter-date").hide();
                    project.filter._current = null;                        
                },
                datepicker: function(target) {
                    target.datepicker({
                        dateFormat: "dd M yy",                        
                        beforeShow: function (input, inst) {                  
                            // active button of datepicker
                            target.parents('button').addClass('active');
                            
                            // set datepicker to small
                            inst.dpDiv.addClass('small not-shadow');
                            
                            // set width to wrapper of datepicker
                            setTimeout(function(){                            
                                inst.dpDiv.outerWidth($("#filter-date").outerWidth());
                            },0);
                                                            
                            // set postion wrapper of datepicker
                            $.datepicker._findPos = function () {
                                position = $("#filter-date").offset();
                                position.top = position.top + 40;
                                position.left = position.left;

                                return [position.left, position.top];
                            };
                                                
                            // set date range in Datepicker
                            if (input.id == 'filter-date-start-input' && !empty($("#filter-date-end-input").val()) ) {                                
                                var maxDate = new Date($("#filter-date-end-input").val());
                                maxDate.setDate(maxDate.getDate() - 1)

                                inst.settings.maxDate = maxDate;
                            }
                            else if (input.id == 'filter-date-end-input' && !empty($("#filter-date-start-input").val()) ) {                                
                                var minDate = new Date($("#filter-date-start-input").val());
                                minDate.setDate(minDate.getDate() + 1)
                                                
                                inst.settings.minDate = minDate;
                            }
                            
                            if (input.id == 'filter-date-start-input') 
                                inst.dataType = 'date-start';                        
                            else if(input.id == 'filter-date-end-input') 
                                inst.dataType = 'date-end';                                                        
                        },
                        onSelect: function(dateText, inst){
                            var outDate = moment(new Date(dateText)).format("DD/MM/YY");
                            tagType = inst.dataType;
                            order = inst.dataType == 'date-end' ? 'tag-last' : '';                        
                            project.filter.tag.add(outDate, tagType, order);
                        },
                        onClose: function (input, inst) {                            
                            inst.dpDiv
                                      .hide()
                                      .removeClass('small not-shadow');                    
                            target.parents('button').removeClass('active');
                        }
                    });
                    target.parents('button').on('click',function(){                    
                        target.datepicker('show');
                    }); 
                }
            },
            tag: {
                init: function () {
                    $(document).on('click','.tag > .tag-remove', function () {
                        $(this).parents('.tag').remove();
                    });

                    $("body").on('DOMSubtreeModified', "#filter-tags", function() {
                        var childrens = $("#filter-tags > *").length;
                        
                        if(childrens >= 1)
                            $("#filter-tags").css('display','flex');
                        else
                            $("#filter-tags").hide();
                    });
                },
                stop: function () {
                    $(document).off('click','.tag > .tag-remove');
                },
                add: function (value, type, order) {
                    var $tag = $("<div/>",{class:"tag " + order,"tag-type": type});
                    var $tag_subtitle = $("<span/>", {class:"tag-subtitle"}).text(value); 
                    var $tag_remove = $("<span/>", {class:"tag-remove uk-position-center-right", "uk-icon":"icon:close"});
                    
                    $("#filter-tags > .tag[tag-type="+type+"]").remove();
                    $("#filter-tags").append($tag.append($tag_subtitle).append($tag_remove));
                },
                remove: function (tag_type) {
                    $(".tag.tag-type-"+tag_type).remove();
                }
            },
            refresh: function() {
                if(empty(this._current))
                    return false;
                                
                project.filter[this._current].close();                
                return true;
            }
        },
        list: {
            init: function () {
                this.load();
                $("#project-list").on("update_project_list DOMSubtreeModified", function () {
                    var list_is_empty  = $("#project-list > .project").length < 1;
                    var msg_is_show    = $("#project-list > .not-project").length == 1;

                    if(list_is_empty)
                        project.list.msg_empty_show();
                    else if(msg_is_show)
                        project.list.msg_empty_hide();
                }).trigger('update_project_list');
            },
            stop: function () {
                $("#project-list").off("update_project_list DOMSubtreeModified");
            },
            load: function () {
                this.load_wait();

                $.ajax({
                    url: "http://localhost:3000/data/project.json",
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        $.each(data, function (index, value) {
                            project.list.add(value);
                        });
                        project.list.load_done();
                    },
                    error: function() {
                        project.list.load_done();
                    }
                });
            },
            load_wait: function () {
                var $overlay = $("<div/>",{id:"project-list-wait", class:"uk-position-center"});
                var $spinner = $("<div/>",{class:"uk-position-center color-primary", "uk-spinner":"ratio: 3"});

                $("#project-list").append($($overlay).append($spinner)).addClass('not-scrolling');
            },
            load_done:function () {
                $("#project-list").removeClass('not-scrolling');
                $("#project-list-wait").remove();
            },
            reset: function () {
                $("#project-list > .project").remove();
            },
            add: function (project) {
                var $wapper = $("<div/>",{class:`project ${project.selected}`,"data-id": project.id});
                var $client_name = $("<span/>",{class:"project-client uk-text-truncate"}).text(project.client);
                var $project_name = $("<span/>",{class:"project-name uk-text-truncate"}).text(project.name);

                $("#project-list").append($($wapper).append($($client_name)).append($($project_name)));
            },
            remove: function (id) {
                $(".project[data-id="+id+"]").remove();
            },
            msg_empty_show: function () {
                if($("#project-list > .not-project").length == 0) {
                    var $wrapper = $("<div/>", {class: "not-project"});
                    var $notification = $("<span/>", {class: "uk-text-center"}).text('There is no project registered!');

                    $("#project-list").append($($wrapper).append($notification));
                }
            },
            msg_empty_hide: function () {
                $("#project-list .not-project").remove();
            }
        }
    };
    task = {
        init: function () {
            this.status.init();
            this.date.init();
            this.time.init();
            this.load_tasks();

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

            // add task
            $(document).on('click', '#btn-task-new', function () {
                var id = $("#create-task").data('id');
                var name = $("#task-input-name").val();
                var status = $("#create-task > .task-status").attr('status-id');
                var date = $("#task-date-input").val();
                var time = $("#task-time-input").val();

                if(empty(name)) {
                    UIkit.notification({
                        message: 'set task name',
                        status: 'danger',
                        pos: 'bottom-center',
                        timeout: 5000
                    });
                    $("#task-input-name").focus();
                    return false;
                }

                if(empty(id)) {
                    id = Number(tasks_list[tasks_list.length - 1].id) + 1;
                    task.add(id, name, status, date, time);
                }
                else
                    task.add_time(id,time);

                task.clear_dock();
            });

            // remove task
            $(document).on('click', '.task .task-remove', function () {
                var target = $(this).parents('.task');
                var task_id = target.attr('task-id');
                task.remove(task_id);
            });

            // start task
            $(document).on('click', '.task:not(.track_task) .btn-task-player', function () {
                var $this = $(this).parents('.task');
                var id = $this.attr('task-id');
                var name = $this.find('.task-name').text();
                var status = $this.find('.task-status').attr('status-id');
                var date = $this.find('.task-date-input').val();
                var time = $this.find('.task-time-input').val();

                task.start(id, name, status, date, time);
            });
        },
        stop: function () {
            this.status.stop();
            this.date.stop();
            this.time.stop();

            $(document).off('click', "#open-new-task");
            $(document).off('click', '#btn-task-close');
        },
        load_tasks: function () {
            $.ajax({
                url: base_url('data/tasks.json'),
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    $.each(data, function (i, task_item) {
                        task.add(task_item.id, task_item.name, task_item.status, task_item.date, task_item.time);
                    });
                }
            });
        },
        add: function (id, name, status, date, time) {
            date = empty(date) ? moment().format("DD/MM/YY") : date;
            status = search_array(status, 'id', status_list);
            status = status ? status : {'id':'','name':'','color':''};
            var dropdown_content = this.status.build_content(status.id);
            var data = {'id' : id, 'name' : name, 'status' : status, 'dropdown_content' : dropdown_content, 'date' : date, 'time' : time};
            var template = $("#task_template").html();
            var task = Mustache.render(template,data);

            $("#board-content").append(task);
            tasks_list.push({id: id, name: name, status: Number(status.id), date: date, time: time});
        },
        remove: function (task_id) {
            $('.task[task-id='+task_id+']').remove();

            // remove task from global list
            var index = null;
            $.each(tasks_list,function (i, task_item) {
                if(task_id == task_item.id) {
                    index = i;
                    return;
                }
            });
            tasks_list.splice(index,1);
        },
        add_time: function (id, time) {
            var target = $('.task[task-id='+id+']').find(".task-time-input");
            time = timer.parserTimer(target.val()) + timer.parserTimer(time);
            time = timer.toString(time);
            target.val(time);
        },
        start: function (id, name, status, date, time) {
            has_starting = $("#create-task").data('id') == id;
            if(has_starting)
                return false;

            this.clear_dock();
            $("#create-task").data('id', id);
            $("#task-input-name").val(name);
            $("#task-date-input").val(date);
            $("#task-time-input").val(time);
            this.status.selected(status, $("#create-task .dropdown"));
            this.tracking(id);
            this.time.play();
        },
        tracking: function (id) {
            if(empty(id))
                return;

            this.untracking();

            var $task = $("#board-content .task[task-id="+id+"]");
            var target = $task.find('.btn-task-player');

            $('#btn-task-player').on('DOMSubtreeModified', function () {
                var status = $(this).data('status');
                var content = $(this).html();

                target.data('status',status);
                target.html(content);
            });
            $(target).on('click.track_task',function () {
                var status = target.data('status');

                if(status == 'pause')
                    task.time.play();
                else if(status == 'play')
                    task.time.pause();
            });
            $task.addClass('track_task');
        },
        untracking: function () {
            $("#board-content .task.track_task").each(function (i,element) {
                var target = $(element).find('.btn-task-player');
                target.data('status','pause').html('<span uk-icon="icon:control-play"></span>');
                $(target).on('click.track_task');
                $(element).removeClass('track_task');
            });
            $('#btn-task-player').off('DOMSubtreeModified');
        },
        clear_dock: function () {
            $("#create-task").data('id','');
            $("#task-input-name").val('');
            $("#task-date-input").val(moment().format("DD/MM/YY"));
            this.time.reset();
            this.status.reset($("#create-task .dropdown"));
            this.untracking();
        },
        status: {
            target: null,

            init: function () {
                this.load_list();

                //load status
                $('.task-status').each(function (i,element) {
                    var $status = $(element);
                    var status_id = $status.attr('status-id');

                    $status.siblings('.dropdown').find('li[status-id='+status_id+']').addClass('active');
                });

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
            },
            reset : function (target) {
                target = !empty(target) ? target : !empty(this.target) ? this.target : null;

                if(empty(target))
                    return;

                var status_id = status_list[0].id;
                this.selected(status_id, target);
            }
        },
        date: {
            init: function () {
                //init date now
                $("#task-date-input").val(moment().format("DD/MM/YY"));

                // set datepicker
                $('#task-date-input').datepicker({
                    beforeShow: function (input, inst) {
                        var task_date = $('#task-date-btn-open');
                        var has_expand = task_date.hasClass('expand');
                        var has_active = task_date.hasClass('active');

                        if(!has_active)
                            task_date.addClass('active');
                        
                        // add overlay mobile    
                        if($(window).width() < 960) {
                            $("#ui-datepicker-div").addClass('fullscreen');
                            overlay.open();
                        }
                        
                        // set postion wrapper of datepicker
                        $.datepicker._findPos = function () {
                            position = has_expand ? $(input).offset() : $(task_date).offset();
                            position.top = has_expand ? position.top + 11 : position.top + 42;
                            position.left = has_expand ? position.left - (300/3) - 35 : position.left - (300/2);

                            return [position.left, position.top];
                        };
                    },
                    onClose: function () {
                        var task_date = $('#task-date-btn-open');
                        var task_date_val = $("#task-date-input").val();
                        var has_expand = task_date.hasClass('expand');

                        // has task date expand
                        if(!has_expand && !empty(task_date_val))
                            task_date.addClass('expand');

                        // blur task date
                        task_date.removeClass('active');

                        // close overlay mobile
                        overlay.close();
                    }
                });

                // open datepick
                $('#task-date-btn-open, #task-date-input').click(function () {
                    task.date.open();
                });

                //close task date
                $("#task-date-btn-close").click(function () {
                    task.date.close();
                    return false;
                });
            },
            stop: function () {

            },
            open: function () {
                $('#task-date-input').datepicker('show');
            },
            close: function () {
                $('#task-date-btn-open').removeClass('expand');
                $("#task-date-input").val('');
            }
        },
        time: {
            init: function () {
                Stopwatch.prototype.parserTimer = function (time) {
                    time = time.split(':');
                    var hr  = time[0];
                    var min = time[1];
                    var sec = time[2];
                    time = 0;

                    time += hr  * 3600000;
                    time += min * 60000;
                    time += sec * 1000;

                    return time;
                };
                Stopwatch.prototype.setStartTime = function (time) {
                    this.previousElapsed = this.parserTimer(time);
                };
                Stopwatch.prototype.toString = function(elapsed) {
                    var duration, hr, min, ms, sec;
                    duration = !empty(elapsed) ? elapsed : this.getElapsed();
                    ms = duration % 1000;
                    duration = (duration - ms) / 1000;
                    sec = duration % 60;
                    duration = (duration - sec) / 60;
                    min = duration % 60;
                    hr = (duration - min) / 60;
                    return ('0' + hr).slice(-2) + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
                };
                timer = new Stopwatch();

                // open task time
                $("#task-time-btn-open").click(function () {
                    task.time.open();
                });

                // close task time
                $("#task-time-btn-close").click(function () {
                    var status = $("#btn-task-player").data('status');

                    if(status == 'play')
                        task.time.pause();

                    task.time.close();
                    return false;
                });

                // events focus
                $("#task-time-input").focus(function () {
                    $("#task-time-btn-open").addClass('active');
                });
                $("#task-time-input").blur(function () {
                    $("#task-time-btn-open").removeClass('active');
                });

                // player control
                $("#btn-task-player").click(function () {
                    var status = $(this).data('status');

                    if(status == 'pause')
                        task.time.play();
                    else if(status == 'play')
                        task.time.pause();
                });
            },
            stop: function () {

            },
            open: function (time) {
                var $task_time = $("#task-time-btn-open");
                var $task_time_input = $("#task-time-input");

                var has_expand = $task_time.hasClass('expand');
                if(!has_expand)
                   $task_time.addClass('expand');

                if(empty($task_time_input.val()) || !empty(time)) {
                    time = empty(time) ? '00:00:00' : time;
                    $task_time_input.val(time);
                }
            },
            close: function () {
                $("#task-time-btn-open").removeClass('expand active');
                $("#task-time-input").val('');
            },
            play: function () {
                this.open();

                var task_time = $("#task-time-input");
                task_time.prop('disabled',true);

                timer.setStartTime(task_time.val());
                timer.start();
                timer.onTick(function() {
                   task_time.val(timer.toString());
                }, 1000);

                $("#btn-task-player")
                                     .data('status','play')
                                     .html('<span uk-icon="icon:control-pause"></span>');
            },
            pause: function () {
                var task_time = $("#task-time-input");
                task_time.prop('disabled',false);

                timer.pause();

                $("#btn-task-player")
                                     .data('status','pause')
                                     .html('<span uk-icon="icon:control-play"></span>');
            },
            reset: function () {
                this.pause();
                $("#task-time-input").val('00:00:00');
            }
        }
    };
 
    // init
    project.init();
    task.init();

    // set mask
    $('.date').mask('00/00/00');
    $('.time').mask('00:00:00');
    $('.date_time').mask('00/00/0000 00:00:00');
});

// set data initial
tasks_list = [];
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
    }
});
$.datepicker._pre_generateHTML = $.datepicker._generateHTML;
$.datepicker._generateHTML = function (inst) {
    var html = this._pre_generateHTML(inst);
    html = html.replace('<span class=\'ui-icon ui-icon-circle-triangle-w\'>Prev</span>','<span uk-icon="icon:chevron-left; ratio: 1.4"></span>');
    html = html.replace('<span class=\'ui-icon ui-icon-circle-triangle-e\'>Next</span>','<span uk-icon="icon:chevron-right; ratio: 1.4"></span>');
    
    return html;
};