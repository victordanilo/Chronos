$(function () {
    task = {
        init: function () {
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
            $(document).off('click', "#open-new-task");
            $(document).off('click', '#btn-task-close');
        }
    };

    // init
    task.init();
});