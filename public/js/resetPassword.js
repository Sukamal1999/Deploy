const resetPasswordBtn = document.getElementById("resetPasswordBtn");

async function updatePassword() {
  try {
    const newPassword = document.getElementById("newPassword").value;
    const res = await axios.post(
      `http://13.234.38.66:3000/password/resetPassword`,
      {
        password: newPassword,
      }
    );
    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    window.location.reload();
  }
}

resetPasswordBtn.addEventListener("click", updatePassword);
