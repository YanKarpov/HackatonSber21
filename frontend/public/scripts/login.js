document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", 
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/skills";  
        } else {
            errorMessage.textContent = data.message;
        }
    })
    .catch(error => {
        errorMessage.textContent = "Ошибка при авторизации.";
        console.error(error);
    });
});
