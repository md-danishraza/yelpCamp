document.getElementById("image").addEventListener("change", function (event) {
  if (this.files.length > 2) {
    alert("Maximum 2 images can be uploaded.");
    this.value = "";
    return;
  }

  for (let i = 0; i < this.files.length; i++) {
    let fileSize = this.files[i].size / (1024 * 1024); // Convert bytes to MB
    if (fileSize > 5) {
      alert("Maximum file size for each image is 5MB.");
      this.value = "";
      return;
    }
  }
});
