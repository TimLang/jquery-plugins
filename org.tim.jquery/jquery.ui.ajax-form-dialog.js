
/*******************************************************************************
 * based on jquery 1.4.4, jquery ui 1.7.3, it's a ajax form dialog.
 * 
 * @author Tim_Lang
 * 
 * @since 2011.3
 */
(function ($) {

    $.dialogForm = function (options) {
        var options = options || {};

        var opts = $.extend(true, {}, $.dialogForm.defaults, options);
        var buttons = {};
        if (!opts.noButtons) {
            buttons = [{
                text: opts.saveButton,
                click: function () {
                	if (opts.isValidate()){
                		opts.beforeSubmitFormCallback();
	                    if (opts.submitFormCustomCallback === undefined) {
	                		submitFormWithAjax($(this).find('form'), this, opts.formSubmitSuccessCallback, opts.additionalFormParams, opts.successfulTip, opts.errorCallback, opts.messageDialogCallback, opts.messageDialogSureButton, opts.messageDialogCancelButton, opts.messageDialogCancelCallback, opts.hasMessageDialogButtons);
	                    } else {
	                        opts.submitFormCustomCallback.call(this);
	                        if (opts.isCloseDialog) {
	                            $(this).dialog('close');
	                        }
	                    }
                	}
                }
            },
            {
                text: opts.cancelButton,
                click: function () {
                    $(this).dialog('close');
                }
            }]
        }

        $.ajax({
            url: opts.url,
            success: function (resp) {
                var dialog = $('<div>').attr('id', 'formDialog').html(
                $(resp).find('form:first').parent('div').html());
                $('body').append(dialog);
                // 隐藏原form中的sumbit按钮
                dialog.find('input[type="submit"]').hide();
                // 防止用户使用回车提交表单
                dialog.find('form:first').submit(function () {
                    return false;
                });

                dialog.dialog({
                    title: opts.title,
                    modal: opts.modal,
                    buttons: buttons,
                    close: function () {
                        $(this).remove();
                    },
                    width: opts.width,
                    height: opts.height,
                    open: opts.openFunction
                });
            },
            global: opts.global
        });

    }

    $.dialogForm.defaults = {
        url: 'site!addSite.action',
        title: '提示窗口',
        isValidate: function(){return true},
        formSubmitSuccessCallback: function () {},
        errorCallback: function () {},
        // 加载Dialog的初始化动作
        openFunction: function () {},
        beforeSubmitFormCallback: function (){},
        submitFormCustomCallback: undefined,
        isCloseDialog: true,
        modal: true,
        global: true,
        width: 'auto',
        height: 'auto',
        noButtons: false,
        saveButton: '保存',
        cancelButton: '取消',
        successfulTip: '操作成功',
        additionalFormParams: '',
        hasMessageDialogButtons: false,
        messageDialogSureButton: '继续下一步设置',
        messageDialogCancelButton: '完成',
        messageDialogCallback: function () {},
        messageDialogCancelCallback: function () {}
    }

    function submitFormWithAjax(form, dialog, formCallback, additionalFormParams, successfulTip, errorCallback, messageDialogCallback, messageDialogSureButton, messageDialogCancelButton, messageDialogCancelCallback, hasMessageDialogButtons) {
        var messageDialog = $("#message-dialog"),
            buttons = [];
        form = $(form);

        setButtons = function (resp) {
            if (hasMessageDialogButtons) {
                buttons[0] = {
                    text: messageDialogSureButton,
                    click: function () {
                        $(this).dialog('close');
                        messageDialogCallback.call(this, resp);
                    }
                };
                buttons[1] = {
                    text: messageDialogCancelButton,
                    click: function () {
                        $(this).dialog('close');
                        messageDialogCancelCallback.call(this, resp);
                    }
                };
            }
            return buttons;
        }

        $.ajax({
            url: form.attr('action'),
            data: form.serialize() + additionalFormParams,
            type: (form.attr('method')),
            dataType: 'script',
            success: function (resp) {
                $(dialog).dialog('close');
                formCallback.call(this, resp);
                messageDialog.html(successfulTip).dialog({
                    buttons: setButtons(resp),
                    modal: true
                });
            },
            error: function () {
                errorCallback.call(this);
            }
        });
        return false;
    }
})(jQuery);