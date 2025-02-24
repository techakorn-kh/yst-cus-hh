const alertMessage = (response) => {
    switch(response.status) {
        case 'success':
            return Swal.fire({
                icon: response.status,
                title: 'Success',
                html: response.message,
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
            }).then((result) => {
                if(result.dismiss == "timer") {
                    if (response.backward) {
                        window.location.href=`${response.backward}`;
                    } else {
                        window.location.reload();
                    }
                } else {
                    window.location.reload();
                }
            });

        case 'error':
            return Swal.fire({
                position: "center",
                icon: response.status,
                title: 'Error',
                html: response.message,
                showConfirmButton: true,
                confirmButtonColor: "#1649bd",
                allowOutsideClick: false
            }).then((result) => {
                if(result?.isConfirmed) {
                    response.backward ? window.location.href=`${response.backward}` : Swal.close();
                } else {
                    window.location.reload();
                }
            });

        case 'warning':
            return Swal.fire({
                position: "center",
                icon: response.status,
                title: 'Warning',
                html: response.message,
                showConfirmButton: true,
                confirmButtonColor: "#1649bd",
                allowOutsideClick: false
            });

        case 'info':
            return Swal.fire({
                position: "center",
                icon: response.status,
                title: 'Info',
                html: response.message,
                showConfirmButton: true,
                confirmButtonColor: "#1649bd",
                allowOutsideClick: false
            });

        case 'question':
            return Swal.fire({
                position: "center",
                icon: response.status,
                title: 'Question'.toUpperCase(),
                html: response.message,
                showConfirmButton: true,
                confirmButtonColor: "#1649bd",
                allowOutsideClick: false
            }).then((result) => {
                console.log(result);
            });
    }
};

const loader = (status) => {
    if(!status) {
        Swal.close();
    } else {
        Swal.fire({
            position: 'center',
            padding: '10em',
            html: `<div class="loader"></div>`,
            background: 'rgba(253, 254, 254, 0.75)',
            backdrop: `
                rgba(253, 254, 254, 0.75)
                no-repeat
            `,
            showConfirmButton: false,
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutDown'
            }
        });
    }
}
