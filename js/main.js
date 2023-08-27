$(document).ready(function () {
    // vars
    const formContactUs = document.querySelector('form#contact-us');
    const inputs = document.querySelectorAll('input[type="tel"]');
    const alertElement = $('#form-message');
    const textAlertElement = $('#form-message-text');
    let iti = null;

    // get form data from GitHub
    const requestConfig = {
        owner: 'Lyubomyr89',
        repo: 'Gvalt',
        path: 'test.json',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    }

    async function getDataFromGitHub() {
        try {
            formContactUs.classList.add('sending-form');
            const response = await fetch(`https://api.github.com/repos/${requestConfig.owner}/${requestConfig.repo}/contents/${requestConfig.path}`)
            if (response.ok) {
                const result = await response.json();
                const fileContents = atob(result.content);
                const file = JSON.parse(fileContents)
                setDefaultFormData(file)
            }
        } catch (err) {
            formContactUs.classList.remove('sending-form');
            console.error(err.message)
        }
    }

    function setDefaultFormData(testData) {
        if (!formContactUs) return;

        const firstName = document.querySelector('#first-name');
        const lastName = document.querySelector('#last-name');
        const email = document.querySelector('#email');

        firstName ? firstName.value = testData.firstName : null;
        lastName ? lastName.value = testData.lastName : null;
        email ? email.value = testData.email : null;
        iti.setNumber(testData.phone.countryCode + testData.phone.number);
        formContactUs.classList.remove('sending-form');
    }


    // datepicker
    $('#datepicker').datepicker();

    // Star rating
    const baseRatingOptions = {
        starSize: 16,
        strokeColor: "#FFA800",
        strokeWidth: 20,
        totalStars: 5,
        emptyColor: 'transparent',
        hoverColor: '#ff8000',
        activeColor: '#FFA800',
        ratedColors: ['#FFA800'],
        useGradient: false,
        useFullStars: false,
        minRating: 1,
    }

    $(".hotels-rating").starRating({
        ...baseRatingOptions,
        readOnly: true,
        callback: function (currentRating, $el) {
            // make a server call here
        }
    });

    //Init intlTelInput
    inputs.forEach(function (phone) {
        if (!phone) return;
        iti = window.intlTelInput(phone, {
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
        });
        phone.addEventListener("input", function (event) {
            iti.isValidNumber() ? this.setCustomValidity("") : this.setCustomValidity("Invalid field.");
        });
    })

    // Form validator
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });

        // Load data from GitHub
        getDataFromGitHub();
    }, false);

    // Form submitting
    formContactUs.addEventListener('submit', formSend)

    async function formSend(e) {
        e.preventDefault();
        const self = this;
        const formName = self.getAttribute('name');
        const error = self.checkValidity();

        if (!error) return;
        self.classList.add('sending-form');

        let formData = new FormData(formContactUs);
        formData.delete('phone');
        formData.append('phone', iti.getNumber());
        formData.append('formName', formName);

        const response = await fetch('../php/send.php', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            self.classList.remove('sending-form');

            if (result.success && result.errors.length === 0) {
                setAlertMessage(result.msg)
                self.reset();
                self.classList.remove('sending-form');
                self.classList.remove('was-validated');
                $(self).find('.form-control').removeClass('is-invalid');
                return;
            }

            if (result.errors.length > 0) {
                $(self).find('.form-control').removeClass('is-invalid');

                const errorFields = result.errors;

                for (const fieldName of errorFields) {
                    const field = self.querySelector(`[name="${fieldName}"]`)
                    field.classList.add('is-invalid')
                }

                setAlertMessage('These forms are not valid. Please check and try again.', 'danger');
                return;
            }

            setAlertMessage(result.msg, 'danger');

        } else {
            self.classList.remove('sending-form');
            setAlertMessage('Form submission error. Please try again.', 'danger')
        }
    }

    // Alerts

    $('.custom-alert .close').on('click', alertClose)

    function setAlertMessage(msg = '', type = 'success') {
        if (!alertElement) {
            console.error('The item is not available. Check the selector.');
            return
        }

        const alertType = 'alert-' + type;
        textAlertElement.text(msg);
        alertElement.addClass(alertType);
        alertElement.show('fade');
        alertAutoClose();
    }

    function alertClose() {
        if (!alertElement) {
            console.error('The item is not available. Check the selector.');
            return
        }


        alertElement.hide('fade');
        alertElement.removeClass('alert-success', 'alert-danger');
    }

    function alertAutoClose() {
        setTimeout(function () {
            alertClose()
        }, 5000);
    }
});
