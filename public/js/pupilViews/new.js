ready(function () {
    'use strict';

    var FIO_REGEX = /^[а-яА-ЯёЁ_\- ]+$/i;
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    //$(document).trigger('lyceum:dataready', 'new');
    var $dialogContent;

    if (!window.pupilViews.newView) {
        window.pupilViews.newView = new NewView();
    } else {
        window.pupilViews.newView = null;
        $(document).off('click', '#saveSettings');
        $(document).off('click', '#saveSettingsPhone');
        $(document).off('click', '.settings-list-item.editable');
        $(document).off('click', '#sendRequestBtn');
        $(document).off('click', '#saveRequest');
        $(document).off('click', '#checkPhone');
        $(document).off('click', '#checkCode');
        $(document).off('change', '#profileInput');
        window.pupilViews.newView = new NewView();
    }
    $dialogContent = $('.view-dialog-content').detach();

    function NewView() {
        var settingView;

        var errorNameF = false;
        var errorNameL = false;
        var errorNameP = false;

        $(document).on('click', '#saveSettings', saveSettings);
        $(document).on('click', '#saveSettingsPhone', saveSettingsPhone);
        $(document).on('click', '#saveRequest', saveRequest);
        $(document).on('click', '.settings-list-item.editable', openSettingsDialog);
        $(document).on('click', '#sendRequestBtn', openSendRequestDialog);

        $(document).on('change', '#profileInput', profileInputChange);

        function saveRequest() {
            if ($('#rulesOk').prop('checked')) {
                var data = {};
                if ($('#agreeOk').length > 0) {
                    data.agreement = $('#agreeOk').prop('checked');
                }
                $.ajax({
                    url: '/api/pupils/profileready',
                    method: 'POST',
                    data: data,
                    statusCode: {
                        200: function (response) {
                            if (response.message === 'ok') {
                                $(document).trigger('lyceum:needReload');
                            } else {

                            }
                        },
                        401: function () {
                            $(document).trigger('lyceum:needReload');
                        },
                        403: function (response) {
                            console.log(response);
                            //TODO Error handle
                            if (response.responseText === '{"error":"invalid_grant","error_description":"Invalid resource owner credentials"}') {
                                loadingEnd();
                                $('#loginPassInput').val('');
                                showUserNotFoundError();
                            }
                            if (response.responseJSON.message === 'email exists') {
                                loadingEnd();
                                showNameExistsError();
                            }
                        }
                    }
                });
            }
        }

        function saveSettingsPhone() {
            $(document).trigger('lyceum:needReload');
        }

        function saveSettings() {
            var data = {};
            if (settingView === 'fio') {
                saveFIO();
            }
            if (settingView === 'request') {
                var files = $('#fileUploadRequest')[0].files,
                    formData = new FormData();

                if (files.length === 0) {
                    return false;
                }

                for (var i=0; i < files.length; i++) {
                    var file = files[i];
                    formData.append('attachment[file]', file);
                }
                loadingStart();
                uploadFiles(formData, 'request');
            }

            if (settingView === 'diplom') {
                var $fileUploadDiplom = $('#fileUploadDiplom');
                var files = $fileUploadDiplom[0].files,
                    formData = new FormData();
                if (files.length === 0) {
                    if ($fileUploadDiplom.parent('.dropify-wrapper').hasClass('has-preview')) {
                        return false;
                    } else {
                        formData.append('attachment[empty]', true);
                    }
                }

                for (var i=0; i < files.length; i++) {
                    var file = files[i];
                    formData.append('attachment[file]', file);
                }
                loadingStart();
                uploadFiles(formData, 'diplom');
            }

            if (settingView === 'additional') {
                var $nightValue = $('#night').val();
                var $distantValue = $('#distant').val();
                if ($nightValue !== '' &&  $distantValue !== '') {
                    data = {
                        night: $nightValue === 'Да',
                        distant: $distantValue === 'Да'
                    };
                    updateAdditional(data);
                }
            }
            if (settingView === 'region') {
                if ($('#regionInput').val() != 'Выберите регион') {
                    data = {
                        region: $('#regionInput').val()
                    };
                    updateRegion(data);
                }
            }
            if (settingView === 'profile') {
                var $profileInputValue = $('#profileInput').val();
                if ($profileInputValue !== 'Выберите профиль') {
                    data = {
                        profile: $profileInputValue,
                        needBel: $('#profileBel').prop('checked')
                    };
                    updateProfile(data);
                }
            }
        }

        function openSendRequestDialog(e) {
            e.preventDefault();
            e.stopPropagation();
            $(document).trigger('lyceum:openRequestDialog');
        }

        function openSettingsDialog(e) {
            e.preventDefault();
            e.stopPropagation();
            settingView = $(e.currentTarget).attr('href');

            if (settingView === 'logout') {
                $(document).trigger('lyceum:logout');
            } else {
                $('.dialog__actions-for-phone').hide();
                $('.dialog__actions-for-everything').hide();

                $(document).trigger('lyceum:openDialog', $dialogContent.find('#' + settingView).html());

                if (settingView === 'phone') {
                    setPhoneLogick();
                    $('.dialog__actions-for-phone').show();
                } else {
                    $('.dialog__actions-for-everything').show();
                }
            }
        }

        function setPhoneLogick() {
            var $checkPhoneBtn = $('#checkPhone');
            var $phoneInput = $('#newPhoneInput');
            var $codeInput = $('#newCodeInput');
            var $phoneCodeContainer = $('#phone-code-container');
            $(document).off('click', '#checkPhone');
            $(document).off('click', '#checkCode');

            $(document).on('click', '#checkPhone', checkPhone);
            $(document).on('click', '#checkCode', checkCode);

            $phoneInput.inputmask("phone", {
                oncomplete: function () {
                },
                onincomplete: function () {
                },
                oncleared: function () {
                },
                onKeyValidation: validatePhoneNumber,
                onUnMask: function(maskedValue, unmaskedValue) {
                    return unmaskedValue;
                }
            });

            function validatePhoneNumber() {
                var maskedPhone = $phoneInput.val();
                var isValid = Inputmask.isValid(maskedPhone, { alias: "phone"});
                $checkPhoneBtn.attr('disabled', !isValid);

                return isValid;
            }

            function checkCode() {
                var code = $codeInput.val();
                console.log(code)
                if (code.length) {
                    updateCode({
                        code: code
                    })
                }
            }

            function checkPhone () {
                var phone = $phoneInput.val();

                var isValid = validatePhoneNumber();

                if (isValid) {
                    updatePhone({
                        phone: phone
                    });
                }
            }
        }

        function updateCode(data) {
            sendUpdateRequest('/api/pupils/code', data, function (response) {
                var $codeInput = $('#newCodeInput');

                if (response.message === 'ok') {
                    var pupil = response.pupil;
                    if (!pupil.codeValid) {
                        $codeInput.parent('.form-input-group').addClass('is-invalid');
                    } else {
                        $('#phone-code-container').fadeOut();
                        $('#phone-valid-container').fadeIn();
                    }
                    //TODO loadingEnd();
                  //  $('#newPhoneInput').val(pupil.phone);
                  //  $(document).trigger('lyceum:showNotification', 'Телефон сохранен');
                  //  $('#phone-code-container').fadeIn();
                    //  $(document).trigger('lyceum:needReload');
                } else {
                    //  auth.login(response.access_token, response.refresh_token);
                    // signInView.hide();
                    //  getUser();
                }
            });
        }

        function updatePhone(data) {
           sendUpdateRequest('/api/pupils/phone', data, function (response) {
                if (response.message === 'ok') {
                    var pupil = response.pupil;
                    //TODO loadingEnd();
                    $('#newPhoneInput').val(pupil.phone);
                    $('#newCodeInput').val('');
                    $(document).trigger('lyceum:showNotification', 'Телефон сохранен, СМС отпралено');
                    $('#phone-code-container').fadeIn();
                    $('#phone-valid-container').fadeOut();
                } else {
                    //  auth.login(response.access_token, response.refresh_token);
                    // signInView.hide();
                    //  getUser();
                }
           });
        }

        function sendUpdateRequest(url, data, onSuccess) {
            $.ajax({
                url: url,
                method: 'POST',
                data: data,
                statusCode: {
                    200: onSuccess,
                    401: function (response) {
                        $(document).trigger('lyceum:needReload');
                    },
                    403: function (response) {
                        console.log(response);
                        //TODO Error handle
                        if (response.responseText === '{"error":"invalid_grant","error_description":"Invalid resource owner credentials"}') {
                            loadingEnd();
                        }
                        if (response.responseJSON.message === 'email exists') {
                            loadingEnd();
                        }
                    }
                }
            });
        }

        function profileInputChange() {
            var selectedOption = $('#profileInput')[0].selectedOptions[0];
            $('#profileBelLabel')[0].MaterialCheckbox.uncheck();
            if ($(selectedOption).data('bel')) {
                $('#belLang')
                    .removeClass('hiddenView')
                    .addClass('visibleView');
            } else {
                $('#belLang')
                    .removeClass('visibleView')
                    .addClass('hiddenView');
            }
        }

        function updateFIO(data) {
            console.log(data);
            $.ajax({
                url: '/api/pupils/fio',
                method: 'POST',
                data: data,
                statusCode: {
                    200: function (response) {
                        if (response.message === 'ok') {
                            var pupil = response.pupil;
                           //TODO loadingEnd();
                            $('#newFirstNameInput').val(pupil.firstName);
                            $('#newLastNameInput').val(pupil.lastName);
                            $('#newParentNameInput').val(pupil.parentName);
                            $(document).trigger('lyceum:showNotification', 'ФИО сохранено.');
                            $(document).trigger('lyceum:needReload');
                        } else {
                          //  auth.login(response.access_token, response.refresh_token);
                           // signInView.hide();
                          //  getUser();
                        }
                    },
                    401: function (response) {
                        $(document).trigger('lyceum:needReload');
                    },
                    403: function (response) {
                        console.log(response);
                        //TODO Error handle
                        if (response.responseText === '{"error":"invalid_grant","error_description":"Invalid resource owner credentials"}') {
                            loadingEnd();
                            $('#loginPassInput').val('');
                            showUserNotFoundError();
                        }
                        if (response.responseJSON.message === 'email exists') {
                            loadingEnd();
                            showNameExistsError();
                        }
                    }
                }
            });
        }

        function updateAdditional(data) {
            $.ajax({
                url: '/api/pupils/additional',
                method: 'POST',
                data: data,
                statusCode: {
                    200: function (response) {
                        if (response.message === 'ok') {
                            var pupil = response.pupil;
                            //TODO loadingEnd();
                            $('#night').prop('checked', pupil.night);
                            $('#distant').prop('checked', pupil.distant);
                            $(document).trigger('lyceum:showNotification', 'Дополнительная информация сохранена');
                            $(document).trigger('lyceum:needReload');
                        } else {
                            //  auth.login(response.access_token, response.refresh_token);
                            // signInView.hide();
                            //  getUser();
                        }
                    },
                    401: function (response) {
                        $(document).trigger('lyceum:needReload');
                    },
                    403: function (response) {
                        console.log(response);
                        //TODO Error handle
                        if (response.responseText === '{"error":"invalid_grant","error_description":"Invalid resource owner credentials"}') {
                            loadingEnd();
                            $('#loginPassInput').val('');
                            showUserNotFoundError();
                        }
                        if (response.responseJSON.message === 'email exists') {
                            loadingEnd();
                            showNameExistsError();
                        }
                    }
                }
            });
        }

        function updateProfile(data) {
            $.ajax({
                url: '/api/pupils/profile',
                method: 'POST',
                data: data,
                statusCode: {
                    200: function (response) {
                        if (response.message === 'ok') {
                            var pupil = response.pupil;
                            //TODO loadingEnd();
                            $('#profileInput').val(pupil.profile);
                            $(document).trigger('lyceum:showNotification', 'Профиль изменён.');
                            $(document).trigger('lyceum:needReload');
                        } else {
                            //  auth.login(response.access_token, response.refresh_token);
                            // signInView.hide();
                            //  getUser();
                        }
                    },
                    401: function (response) {
                        $(document).trigger('lyceum:needReload');
                    },
                    403: function (response) {
                        console.log(response);
                        //TODO Error handle
                        if (response.responseText === '{"error":"invalid_grant","error_description":"Invalid resource owner credentials"}') {
                            loadingEnd();
                            $('#loginPassInput').val('');
                            showUserNotFoundError();
                        }
                    }
                }
            });
        }

        function updateRegion(data) {
            $.ajax({
                url: '/api/pupils/region',
                method: 'POST',
                data: data,
                statusCode: {
                    200: function (response) {
                        if (response.message === 'ok') {
                            var pupil = response.pupil;
                            //TODO loadingEnd();
                            $('#regionInput').val(pupil.region);
                            $(document).trigger('lyceum:showNotification', 'Регион сохранён.');
                            $(document).trigger('lyceum:needReload');
                        } else {
                            //  auth.login(response.access_token, response.refresh_token);
                            // signInView.hide();
                            //  getUser();
                        }
                    },
                    401: function (response) {
                        $(document).trigger('lyceum:needReload');
                    },
                    403: function (response) {
                        console.log(response);
                        //TODO Error handle
                        if (response.responseText === '{"error":"invalid_grant","error_description":"Invalid resource owner credentials"}') {
                            loadingEnd();
                            $('#loginPassInput').val('');
                            showUserNotFoundError();
                        }
                        if (response.responseJSON.message === 'email exists') {
                            loadingEnd();
                            showNameExistsError();
                        }
                    }
                }
            });
        }

        function uploadFiles(formData, url) {
            $.ajax({
                url: '/api/pupils/' + url,
                method: 'post',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                dataType: 'json',
                type: 'POST',
                xhr: function () {
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function (event) {
                        var progressBar = $('.progress-bar');
                        console.log(event)
                        if (event.lengthComputable) {
                            var percent = (event.loaded / event.total) * 100;
                            progressBar.width(percent + '%');

                            if (percent === 100) {
                                progressBar.removeClass('active');
                            }
                            console.log(percent)
                        }
                    });

                    return xhr;
                }
            })
                .done(handleSuccess)
                .fail(function (xhr, status) {
                    $(document).trigger('lyceum:globalError');
                    loadingEnd();
                });
        }

        function handleSuccess(data) {
            $(document).trigger('lyceum:showNotification', 'Файл загружен.');
            $(document).trigger('lyceum:needReload');
            loadingEnd();
        }

        function saveFIO() {
            var data = checkFIOInputs();

            if (!errorNameF && !errorNameL && !errorNameP) {
                updateFIO(data);
            }
        }

        function checkFIOInputs() {
            var valueF = $('#newFirstNameInput').val().trim();
            var valueL = $('#newLastNameInput').val().trim();
            var valueP = $('#newParentNameInput').val().trim();

            errorNameF = valueF.length > 0 ? !FIO_REGEX.test(valueF) : false;
            errorNameL = valueL.length > 0 ? !FIO_REGEX.test(valueL) : false;
            errorNameP = valueP.length > 0 ? !FIO_REGEX.test(valueP) : false;

            return {
                firstName: valueF.capitalize(),
                lastName: valueL.capitalize(),
                parentName: valueP.capitalize()
            }
        }

    }
});